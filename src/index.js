'use strict';

import React from 'react';
import {clone} from 'deep';
import deepEqual from 'deep-equal';
import uuid from 'node-uuid';

import log from './log.js';
import lifecycleConfig from './store/lifecycleConfig';

function Insure(WrappedComponent) {

	// if (process.env.NODE_ENV === 'production') {
	//
	// 	return class ComponentWrapper extends WrappedComponent {
	//
	// 		shouldComponentUpdate(nextProps, nextState) {
	//
	// 			if (super.shouldComponentUpdate) {
	// 				const isSuperAllowingUpdate = super.shouldComponentUpdate(nextProps, nextState);
	// 				if (!isSuperAllowingUpdate) {
	// 					return false;
	// 				}
	// 			}
	//
	// 			return (
	// 				nextState !== this.state
	// 				|| nextProps !== this.props
	// 				|| !deepEqual(nextState, this.state, {strict: true})
	// 				|| !deepEqual(nextProps, this.props, {strict: true})
	// 			);
	//
	// 		}
	//
	// 	};
	// }

	return class DevComponentWrapper extends WrappedComponent {

		static displayName = `Insure(${getComponentName(WrappedComponent)})`;

		logEntryId = null;
		autoRenderCount = 0;
		isInfiniteLoop = false;
		isRenderingComplete = true;
		consoleWindow = null;
		lifecycleLocation = '';

		constructor(props) {
			super(...arguments);
			// if (!this.key) {
			// 	this.key = uuid.v1();
			// }
			this.logEntryId = log.add({
				type: 'ADD_ENTRY',
				key: props.id,
				name: getComponentName(WrappedComponent)
			});
			//this.consoleWindow.log[this.logEntryId] = clone(log.get(this.logEntryId));
			this.isRenderingComplete = false;
			this.lifecycleLocation = 'mounting';
			this.clearCalled();
			this.handleLifecycleEvent({
				name: 'constructorMethod',
				props: [props]
			});
			let methodObj = {};
			Object.keys(methodProperties()).forEach((name) => {
				const methodName = name === 'constructorMethod' ? 'constructor' : name;
				methodObj[name] = {
					isMethodOverridden: Boolean(super[methodName])
				}
			});
			log.updateStore({
				type: 'UPDATE_METHODS',
				key: this.logEntryId,
				value: methodObj
			});
		}

		componentWillMount() {
			this.handleLifecycleEvent({
				name: 'componentWillMount',
				props: [this.props],
				state: [this.state]
			});
		}

		componentDidMount() {
			this.consoleWindow = log.getWindow();
			this.handleLifecycleEvent({
				name: 'componentDidMount',
				props: [this.props],
				state: [this.state]
			});
			this.isRenderingComplete = true;
			this.setIsMounted(true);
			log.updateWindow();
		}

		componentWillReceiveProps(nextProps) {
			this.lifecycleLocation = 'updating';
			this.clearCalled();
			this.handleLifecycleEvent({
				name: 'componentWillReceiveProps',
				props: [this.props, nextProps],
				state: [this.state]
			});
			this.isRenderingComplete = false;
		}

		shouldComponentUpdate(nextProps, nextState) {

			this.lifecycleLocation = 'updating';
			this.isInfiniteLoop = this.autoRenderCount >= 10;

			let shouldWrappedComponentUpdate;
			let isSuperAllowingUpdate = null;
			if (super.shouldComponentUpdate) {
				isSuperAllowingUpdate = super.shouldComponentUpdate(nextProps, nextState);
			}
			let arePropsEqual = nextProps === this.props;
			let areStatesEqual = nextState === this.state;
			let isWrappedComponentGoingToUpdate = !arePropsEqual || !areStatesEqual;
			if (!isWrappedComponentGoingToUpdate) {
				shouldWrappedComponentUpdate = false;
			} else {
				arePropsEqual = deepEqual(nextProps, this.props, {strict: true});
				areStatesEqual = deepEqual(nextState, this.state, {strict: true});
				shouldWrappedComponentUpdate = !arePropsEqual || !areStatesEqual;
			}

			const isUnnecessaryUpdatePrevented = isWrappedComponentGoingToUpdate
				&& !shouldWrappedComponentUpdate
				&& isSuperAllowingUpdate !== false;
			if (isUnnecessaryUpdatePrevented) {
				this.incrementUnnecessaryUpdatesPrevented();
			}
			if (this.isRenderingComplete) {
				this.clearCalled();
			}
			this.handleLifecycleEvent({
				name: 'shouldComponentUpdate',
				props: [this.props, nextProps],
				state: [this.state, nextState],
				isUnnecessaryUpdatePrevented
			});
			let willUpdate;
			// TODO Will there be cases where desired behavior sets isInfiniteLoop to true?
			if (this.isInfiniteLoop) {
				willUpdate = false;
			} else if (isSuperAllowingUpdate === false) {
				willUpdate = false;
			} else if (shouldWrappedComponentUpdate) {
				this.isRenderingComplete = false;
				willUpdate = true;
			} else {
				this.isRenderingComplete = true;
				willUpdate = false;
			}
			if (willUpdate) {
				return true;
			} else {
				log.updateWindow();
				return false;
			}

		}

		componentWillUpdate(nextProps, nextState) {
			this.handleLifecycleEvent({
				name: 'componentWillUpdate',
				props: [this.props, nextProps],
				state: [this.state, nextState]
			});
		}

		componentDidUpdate(prevProps, prevState) {
			this.isRenderingComplete = true;
			this.handleLifecycleEvent({
				name: 'componentDidUpdate',
				props: [prevProps, this.props],
				state: [prevState, this.state]
			});
			log.updateWindow();
		}

		componentWillUnmount() {
			this.lifecycleLocation = 'unmounting';
			this.isRenderingComplete = true;
			this.setIsMounted(false);
			this.clearCalled();
			this.handleLifecycleEvent({
				name: 'componentWillUnmount',
				props: [this.props],
				state: [this.state]
			});
			log.updateWindow();
		}

		handleLifecycleEvent = (lifecycleData) => {
			let count = log.getFromStore([
				'entries',
				this.logEntryId,
				'methods',
				lifecycleData.name,
				'count'
			]);
			const method = {
				name: lifecycleData.name,
				called: true,
				count: count + 1,
				isInfiniteLoop: this.isInfiniteLoop,
				isUnnecessaryUpdatePrevented: lifecycleData.isUnnecessaryUpdatePrevented,
				lifecycleLocation: this.lifecycleLocation
			};
			log.updateStore({
				type: 'UPDATE_METHOD',
				entryId: this.logEntryId,
				methodName: lifecycleData.name,
				value: method
			});
			const config = lifecycleConfig[name];
			let propsAndState = {};
			// TODO remove redundant code with a loop
			if (config.save) {
				if (config.save.includes('props')) {
					log.updateStore({
						type: 'UPDATE_PROPSANDSTATE',
						keyPath: [this.logEntryId, 'props', [lifecycleData.lifecycleLocation]],
						value: lifecycleData.props
					});
				}
				if (config.save.includes('state')) {
					log.updateStore({
						type: 'UPDATE_PROPSANDSTATE',
						keyPath: [this.logEntryId, 'state', [lifecycleData.lifecycleLocation]],
						value: lifecycleData.state
					});
				}
			}
		};

		// Remove children because they can contain
		// circular references, which cause problems
		// with cloning and stringifying
		removeCircularReferences = (props) => {
			if (!props) {
				return null;
			}
			let newProps = Object.assign({}, props);
			if (newProps.hasOwnProperty('children')) {
				delete newProps.children;
			}
			return newProps;
		};

		clearCalled = () => {
			this.autoRenderCount = 0;
			let methodObj = {};
			Object.keys(methodProperties()).forEach((name) => {
				methodObj[name] = {
					called: false
				};
			});
			log.updateStore({
				type: 'UPDATE_METHODS',
				key: this.logEntryId,
				value: methodObj
			});
		};

		incrementRenderCount = () => {
			this.autoRenderCount++;
			log.updateStore({
				type: 'INCREMENT_VALUE',
				keyPath: [this.logEntryId, 'renderCount']
			})
		};

		setIsMounted = (isMounted) => {
			log.updateStore({
				type: 'UPDATE_VALUE',
				keyPath: [this.logEntryId, 'isMounted'],
				value: isMounted
			});
		};

		incrementUnnecessaryUpdatesPrevented = () => {
			log.updateStore({
				type: 'INCREMENT_VALUE',
				keyPath: [this.logEntryId, 'unnecessaryUpdatesPrevented']
			});
		};

		render() {

			this.incrementRenderCount();
			this.handleLifecycleEvent({
				name: 'render'
			});
			return super.render();

		}
	};

}

const getComponentName = (component) => {
	return component ? component.displayName
	|| component.name
	|| 'Component'
		: ''
};

export default Insure;