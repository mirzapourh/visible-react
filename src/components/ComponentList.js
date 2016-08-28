import React, {Component} from 'react';
import Radium from 'radium';
import color from 'color';
import ReactTooltip from 'react-tooltip';

import styles from '../styles/styles';

class ComponentList extends Component {

	styles = {
		container: {
			padding: '10px'
		},
		heading: {
			marginBottom: '10px',
			fontSize: '14px',
			fontWeight: 'bold'
		},
		row: {
			display: 'flex',
			minWidth: '150px',
			opacity: '1',
			animation: 'x 1s ease-out',
			animationName: Radium.keyframes({
				'0%': {opacity: '0'},
				'60%': {opacity: '0.7'},
				'100%': {opacity: '1'}
			})
		},
		component: {
			flex: '1',
			marginRight: '10px',
			padding: '3px 5px',
			cursor: 'pointer',
			fontWeight: 'bold',
			wordBreak: 'break-all'
		},
		unmountedComponent: {
			fontWeight: 'normal',
			color: 'gray'
		},
		selectedComponent: {
			backgroundColor: color('lightblue').lighten(.1).hexString()
		},
		renderCount: {
			minWidth: '30px',
			padding: '3px 0'
		},
		warning: {
			minWidth: '20px',
			padding: '3px 0',
			color: 'red',
			fontWeight: 'bold'
		}
	};

	getComponents = () => {
		const sortedComponentIds = this.getSortedComponentIds(this.props.entries);
		return sortedComponentIds.map((id, ind) => {
			const entry = this.props.entries[id];
			let componentStyle = [this.styles.component];
			if (!entry.isMounted) {
				componentStyle.push(this.styles.unmountedComponent);
			}
			if (this.props.selectedComponentId === id) {
				componentStyle.push(this.styles.selectedComponent);
			}
			let warningMessage = '';
			if (entry.unnecessaryUpdatesPrevented) {
				warningMessage = `${entry.unnecessaryUpdatesPrevented} unnecessary rerenders prevented`;
			}
			return (
				<div
					key={'component-name-' + ind}
					style={this.styles.row}
					onClick={this.handleComponentSelected.bind(this, id)}
				>
					<div style={componentStyle}>{entry.displayName}</div>
					<div style={this.styles.renderCount} data-tip={warningMessage}>{entry.renderCount}</div>
					<div data-tip={warningMessage} style={this.styles.warning}>{entry.unnecessaryUpdatesPrevented || ''}</div>
					<ReactTooltip
						place='right'
						effect='solid'
						type='error'
						delayShow='100'
					/>
				</div>
			);
		});
	};

	getSortedComponentIds = (components) => {
		return Object.keys(components).sort((a, b) => {
			const nameA = components[a].displayName.toLowerCase();
			const nameB = components[b].displayName.toLowerCase();
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1
			}
			return 0;
		});
	};

	handleComponentSelected = (id) => {
		const option = {selectedComponentId: id};
		this.props.onChange(option);
	};

	render() {

		return (
			<div style={this.styles.container}>
				<div style={this.styles.heading}>Available Components</div>
				{this.getComponents()}
			</div>
		)

	}

}

export default Radium(ComponentList);