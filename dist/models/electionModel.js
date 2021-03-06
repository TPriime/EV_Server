'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Election = new Schema({
  electionCode: {
    type: String,
    unique: true,
    required: true
  },
  electionParties: [{
    name: { type: String, required: true }
  }],
  electionName: {
    type: String,
    required: true
  },
  electionDate: {
    type: Date,
    required: true
  },
  electionAvailable: {
    type: Boolean,
    default: false
  }
});

module.exports = _mongoose2.default.model('Election', Election);
//# sourceMappingURL=electionModel.js.map