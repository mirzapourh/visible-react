'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hoverColor = (0, _color2.default)('lightblue').darken(0.1).hexString();
var activeColor = (0, _color2.default)('lightblue').darken(0.2).hexString();

var styles = {
	base: {
		fontFamily: 'Arial, Helvetica, sans-serif',
		fontSize: '12px'
	},
	box: {
		padding: '10px',
		border: '1px solid lightgray',
		boxShadow: '4px 4px 8px rgba(0, 0, 0, .5)'
	},
	input: {
		width: '200px',
		margin: '5px 5px 0 0'
	},
	button: {
		height: '20px',
		width: '85px',
		padding: '0',
		backgroundColor: 'lightblue',
		border: '1px solid lightblue',
		borderRadius: 'none',
		boxShadow: '2px 2px 5px rgba(0, 0, 0, .5)',
		outline: 'none',
		cursor: 'pointer',
		':hover': {
			backgroundColor: hoverColor,
			border: '1px solid ' + hoverColor
		},
		':active': {
			backgroundColor: activeColor,
			border: '1px solid ' + activeColor
		}
	},
	description: {
		marginTop: '5px',
		color: 'red',
		fontWeight: 'normal'
	},
	props: {
		color: 'blue'
	},
	state: {
		color: '#4caf50'
	}
};

exports.default = styles;
module.exports = exports['default'];