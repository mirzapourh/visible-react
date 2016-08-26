'use strict';

import React, {Component, PropTypes} from 'react';
import {hashHistory} from 'react-router';
import Radium from 'radium';

import Keywords from './Keywords';
import Byline from './Byline';
import styles from '../styles/styles';

class Question extends Component {

	static propTypes = {
		title: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		date: PropTypes.number.isRequired,
		keywords: PropTypes.array.isRequired,
		answers: PropTypes.array.isRequired
	};

	styles = {
		title: {
			marginBottom: '5px',
			color: '#04aec3',
			fontSize: '16px',
			cursor: 'pointer',
			':hover': {
				opacity: '.5'
			}
		}
	};

	handleQuestionClicked = () => {
		hashHistory.push('question/' + this.props.id);
	};

	render() {
		return (
			<div style={styles.question} className='question'>
				<div onClick={this.handleQuestionClicked} style={this.styles.title}>
					{this.props.title}
				</div>
				<Keywords keywords={this.props.keywords}/>
				<Byline
					user={this.props.user}
					date={this.props.date}
					answerCount={this.props.answers.length}
				/>
			</div>
		);
	}

}

export default Radium(Question);