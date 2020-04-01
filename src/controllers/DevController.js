const axios = require('axios');

const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports =  {
    async index(req, res) {
        const devs = await Dev.find();
        return res.json(devs);
    },
    async store(req, res) {
        const { github_username, techs, latitude, longitude}  = req.body;

        let dev = await Dev.findOne({ github_username });
        if(!dev){
            const response = await axios.get(`https://api.github.com/users/${github_username}`);
            const { name = login, avatar_url, bio,} = response.data;

            const techsArray = parseStringAsArray(techs);
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };

            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            }); 

            const sendSocketMessageTo = findConnections(
                { 
                    latitude,
                    longitude 
                }, 
                techs,
            );
            
            sendMessage(sendSocketMessageTo, 'new-dev', dev)
        }else{
            console.log('Usuário já cadastrado');
        }
        return res.json(dev);
    },
/*    async update(req, res) {
        try{
            const dev = req.params;
            return res.json({ dev });
        } catch (err) {
            return res.status(400).json({ error: 'Error updating Dev' });
        }
    }/*,
    async delete(req, res) {
        try{
            const dev = req.params;
            return res.json({ dev });
        } catch (err) {
            return res.status(400).json({ error: 'Error deleting Dev' });
        }
    }*/
}