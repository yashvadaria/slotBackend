const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require("../models/userSchema");

router.post('/signup', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(
            user => {
                if (user.length > 0) {
                    return res.status(409).json({
                        message: "User exists"
                    })
                }
                else {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            });
                        }
                        else {
                            const user = new User({
                                _id: new mongoose.Types.ObjectId(),
                                email: req.body.email,
                                password: hash
                            });
                            user
                                .save()
                                .then(result => {
                                    console.log(result);
                                    res.status(200).json({
                                        message: "New user Created"
                                    })
                                })
                                .catch(err => {
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        }
                    });
                }
            }
        );
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(
            user => {
                if (user.length < 1) {
                    return res.status(401).json({
                        message: "Auth failed"
                    })
                }
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        res.status(401).json({
                            error: err
                        })
                    }
                    if (result) {
                        const token = jwt.sign({
                            email: user[0].email,
                            password: user[0].password
                        },
                            process.env.JWT_KEY,
                            {
                                expiresIn: "1h"
                            }
                        );
                        return res.status(200).json({
                            message: "successfully login",
                            token: token
                        })
                    }
                    res.status(401).json({
                        message: "Auth failed"
                    })
                })

            }).catch(err => {
                res.status(500).json({
                    error: err
                });
            })
})

module.exports = router;