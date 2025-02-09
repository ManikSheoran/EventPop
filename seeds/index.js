const mongoose = require("mongoose");
const Camp = require("../models/camp");
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

require('dotenv').config();

mongoose.set('strictQuery', true);

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log("Mongo Connection Open!!!");
    })
    .catch(err => {
        console.log("OH NO ERROR!!!");
        console.log(err);
    });

const seedDB = async () => {
    await Camp.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const randi = Math.floor(Math.random() * 130);
        const randprice = Math.floor(Math.random() * 1000) + 999;
        const rand1 = Math.floor(Math.random() * descriptors.length);
        const rand2 = Math.floor(Math.random() * places.length);
        const camp = new Camp({
            author: '66850adabe94f7683a480170',
            title: `${descriptors[rand1]} ${places[rand2]}`,
            image: {
                url: "https://images.unsplash.com/photo-1507584359040-f44a16355689?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                filename: "camp"
            },
            location: `${cities[randi].city}, ${cities[randi].state}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure expedita aliquid repudiandae consequuntur totam et maiores, delectus facere, corporis quaerat facilis nisi quis illo! Magni placeat consequuntur assumenda consequatur error.",
            price: randprice,
            geometry: {
                type: "Point",
                coordinates: [cities[randi].longitude, cities[randi].latitude]
            }

        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
