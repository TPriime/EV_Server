import { Router } from 'express';
import User from '../models/userModel';
import { validateToken } from '../middleware/accessToken';
let uuid4 = require('uuid4');
require('babel-polyfill');////////////// for build purpose

export default ({ config, db}) => {
    let api = Router();

    // 'evoting_api/v1/users/register' Endpoint to create a new user
    api.post('/register', async (req, res) => {
        validateToken(req, res);

        if (!req.files) return res.status(400).json({message: "No files were uploaded"});

        let mediaFile = req.files.userProfilePicture;

        try {
            let existingCardID = await User.findOne({cardID: req.body.cardID});
            if(existingCardID) return res.status(400).json({message: 'cardID already in use'});

            let existingUserEmail = await User.findOne({userEmail: req.body.userEmail});
            if(existingUserEmail) return res.status(400).json({message: 'Email already in use'});

            let existingUserphone = await User.findOne({phoneNumber: req.body.phoneNumber});
            if (existingUserphone) return res.status(400).json({message: 'Phone number already in use'});

            let userid = uuid4();

            const data = {
                userID: userid,
                cardID: req.body.cardID,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                otherNames: req.body.otherNames,
                phoneNumber: req.body.phoneNumber,
                dateOfBirth: req.body.dateOfBirth,
                gender: req.body.gender,
                state: req.body.state,
                lga: req.body.lga,
                maritalStatus: req.body.maritalStatus,
                occupation: req.body.occupation,
                userEmail: req.body.userEmail,
                fingerprint: req.body.fingerprint,
                userProfilePicture: JSON.stringify(mediaFile.data),
                userProfilePictureId: " "
            }

            let upload;
            try {
                upload = await User.create(data);
            } catch(err){
                return res.status(401).json({message: "Registration was not successful"});
            }

            res.json({message: 'Registration done.', upload});

        } catch (error) {
            console.log(error);
            res.status(422).json(error);
        }
    });

    // 'evoting_api/v1/users' Endpoint to see all users, admin only
    api.get('/', async (req, res)=> {

        validateToken(req, res);

        try {
            let users = await User.find();

            if (users.length === 0) return res.status(401).json({message: "No user found"});
            res.json(users);
        } catch (error) {
            res.status(422).json({error: error});
        }
    });

    // '/evoting_api/v1/users/id' Endpoint to get a user and search user included!!!
    api.get('/:id', async (req, res)=> {

        const id = req.params.id;
        if (req.params.id === 'search') { // '/evoting_api/v1/users/search' Endpoint to get a User in the database
            let q, result;
            try {
                if (req.query.userEmail) {
                    q = req.query.userEmail;
                    result = await User.find({
                        userEmail: {
                            $regex: new RegExp(q,'i')
                        }},{
                            __v: 0
                        });
                }else if (req.query.firstName) {
                    q = req.query.firstName;
                    result = await User.find({
                        firstName: {
                            $regex: new RegExp(q,'i')
                        }},{
                            __v: 0
                        });
                }else if (req.query.lastName) {
                    q = req.query.lastName;
                    result = await User.find({
                        lastName: {
                            $regex: new RegExp(q,'i')
                        }},{
                            __v: 0
                        });
                }else if (req.query.lastName && req.query.userEmail && req.query.firstName) {
                    q = req.query.firstName;
                    r = req.query.lastName;
                    p = req.query.userEmail;
                    result = await User.find({
                        $or: [
                            {firstName:{$regex: new RegExp(q,'i')}},
                            {lastName:{$regex: new RegExp(r,'i')}},
                            {userEmail:{$regex: new RegExp(p,'i')}}
                        ]
                    },{
                        __v: 0
                    });
                }
                if(result.length === 0) res.status(401).json({message: "No user found"});
                res.json(result);
            } catch (error) {
                res.status(417).json({ message: "Could not find any User                                                                                                                    "});
            }
        }else{
            try {
                let user = await User.findOne({_id: id},{__v: 0});

                if (!user) {
                    return res.status(401).json({message: "No user found"});
                }

                res.json(user);
            } catch (error) {
                res.status(422).json({error: "The error"});
            }
        }
    });

    // '/evoting_api/v1/users/update/:id' Endpoint to update any user parameters
    api.put('/update/:id', async (req, res) => {
        validateToken(req, res);
        const id = req.params.id;
        const {firstName,lastName,otherNames,dateOfBirth,gender,state,lga,maritalStatus,occupation} = req.body;

        try {
            let user = await User.findByIdAndUpdate(id, {firstName,lastName,otherNames,dateOfBirth,gender,state,lga,maritalStatus,occupation});
            if (!user) return res.status(401).json({message: "No user found"});
            res.json({message: 'Update successful'});
        } catch (error){
            res.status(422).json({error: error});
        }
    });

    // '/evoting_api/v1/users/delete/:id' Endpoint to delete any user
    api.delete('/delete/:id', async (req, res) => {

        validateToken(req, res);

        const id = req.params.id;
        try {
            let user = await User.findByIdAndDelete(id);
            if (!user) return res.status(401).json({message: "No user found"});
            res.json({message: 'User account deleted successfully'});

        } catch (error) {
            res.status(422).json({error: error});
        }
    });

    return api;
}
