var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Model = require('../models/guess');
var Verify = require('./verify');

var router = express.Router();
router.use(bodyParser.json());

router.route('/')
    .get(function (req, res, next) {
        Model.find({})
            .populate('comments.postedBy')
            .exec(function (err, response) {
                if (err) return next(err);
                res.json(response);
            });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        req.body.ownerId = req.decoded._doc._id;
        Model.create(req.body, function (err, response) {
            console.log(err);
            if (err) return next(err);
            console.log('Guess created!');
            var id = response._id;
            res.json(response);
        });
    })

    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        Model.remove({}, function (err, response) {
            if (err) return next(err);
            res.json(response);
        });
    });

router.route('/:id')
    .get(function (req, res, next) {
        Model.findById(req.params.id)
            .populate('comments.postedBy')
            .exec(function (err, response) {
                if (err) return next(err);
                res.json(response);
            });
    })

    .put(Verify.verifyOrdinaryUser, function (req, res, next) {
        Model.update({ _id: req.params.id, 'voters.voterId': { $ne: req.decoded._doc._id } }, {
            $push: { "voters": { "voterId": req.decoded._doc._id, "voterChoice": req.body.answer } }
        }, {
                new: true
            }, function (err, response) {
                if (err) return next(err);
                res.json(response);
            });
    })

    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        Model.findByIdAndRemove(req.params.id, function (err, response) {
            if (err) return next(err);
            res.json(response);
        });
    });

router.route('/:id/comments')
    .get(function (req, res, next) {
        Model.findById(req.params.id)
            .populate('comments.postedBy')
            .exec(function (err, response) {
                if (err) return next(err);
                res.json(response.comments);
            });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        Model.findById(req.params.id, function (err, response) {
            console.log(err);
            if (err) throw err;
            req.body.postedBy = req.decoded._doc._id;
            response.comments.push(req.body);
            response.save(function (err, response) {
                if (err) return next(err);
                console.log('Updated Comments!');
                res.json(response);
            });
        });
    })

    .delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        Model.findById(req.params.id, function (err, response) {
            if (err) return next(err);
            for (var i = (response.comments.length - 1); i >= 0; i--) {
                response.comments.id(response.comments[i]._id).remove();
            }
            response.save(function (err, response) {
                if (err) throw err;
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end('Deleted all comments!');
            });
        });
    });

router.route('/:id/comments/:commentId')
    .all(Verify.verifyOrdinaryUser).get(function (req, res, next) {
        Model.findById(req.params.id)
            .populate('comments.postedBy')
            .exec(function (err, response) {
                if (err) return next(err);
                res.json(response.comments.id(req.params.commentId));
            });
    })

    .put(function (req, res, next) {
        Model.findById(req.params.id, function (err, response) {
            if (err) return next(err);
            response.comments.id(req.params.commentId).remove();
            req.body.postedBy = req.decoded._doc._id;
            response.comments.push(req.body);
            response.save(function (err, response) {
                if (err) throw err;
                console.log('Updated Comments!');
                res.json(response);
            });
        });
    })

    .delete(function (req, res, next) {
        Model.findById(req.params.id, function (err, response) {
            if (response.comments.id(req.params.commentId).postedBy
                != req.decoded._doc._id) {
                var err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
            response.comments.id(req.params.commentId).remove();
            response.save(function (err, response) {
                if (err) return next(err);
                res.json(response);
            });
        });
    });

module.exports = router;