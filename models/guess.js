var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
        timestamps: true
    });

var ruleSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    }
}, {
        timestamps: true
    });

var votersSchema = new Schema({
    _id: false,
    voterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    voterChoice: {
        type: Number
    }
});

var guessSchema = new Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guessName: {
        type: String,
        required: true
    },
    guessImage: {
        type: String,
        required: false,
        default: "images/guess.png",
    },
    answerImage: {
        type: String,
        required: false,
        default: "images/answer.png",
    },
    category: {
        type: String,
        required: false,
    },
    options: {
        type: [String],
        default: "",
    },
    selectedAnswer: {
        type: Number
    },
    description: {
        type: String
    },
    voters: [votersSchema],
    rules: ruleSchema,
    comments: [commentSchema]
}, {
        timestamps: true
    });

var Guess = mongoose.model('Guess', guessSchema);

module.exports = Guess;