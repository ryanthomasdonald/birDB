const express = require("express");
const router = express.Router()
const gatekeeper =  require("../auth");
const db = require("../models");
const Sequelize = require("sequelize")
const Op = Sequelize.Op;
const {monthNames, getUsername, getDates, getFollowingUsers, arrayIterator, getRecentPostData} = require("../modules/lib");

let date = new Date();
// three days back
date.setDate(date.getDate() - 3);

router.get("/search", gatekeeper, async(req, res) => {
    // try {
        let record = await db.users.findByPk(req.user.id);
        let search = req.query.search;
        console.log(search);

        let postsQuery = [];
        // query posts table by searchString for: common name, sci name; join results of both into array to be sent to front-end
        let commonQuery = await db.posts.findAll({where: {commonName: search}});
        if (commonQuery.length >= 1) {
            commonQuery.forEach(post => {
                postsQuery.push(post.dataValues)
            })
        }
        // console.log(postsQuery);
        let sciQuery = await db.posts.findAll({where: {scientificName: search}});
        if (sciQuery.length >= 1) {
            sciQuery.forEach(post => {
                postsQuery.push(post.dataValues)
            })
        }
        console.log(postsQuery);

        
        // let postsQueryDates = getDates(postsQuery);
        let postsQueryUsernames = await arrayIterator(postsQuery, getUsername);
        
        // query users table by searchString for username; return result to front-end
        // let userQueryData = getUserQuery(search)

        let {recentPosts, dates, usernames} = await getRecentPostData(date);
        let followingIDList = (record.following !== null)? record.following.split(','): [];
        let following = await arrayIterator(followingIDList, getFollowingUsers);
        
        recentPosts.forEach(post => {
            let rawDate = post.dataValues.createdAt
            let formattedDate = {
                "month": monthNames[rawDate.getMonth()], 
                "day": rawDate.getDate()
            }
            dates.push(formattedDate);
        });

        res.render("search", {
            // send arrays of both sets of query data back here
            // also send: following, recent posts, dates for recent posts, and usernames for recent posts
            username: record.username,
            userID: record.id,
            postsQuery: postsQuery,
            postsQueryUsernames: postsQueryUsernames,
            following: following,
            recentPosts: recentPosts,
            dates: dates,
            usernames: usernames

            // keep working on getting this data to work properly...
            // postsQueryDates: postsQueryDates,
            // userQueryData: userQueryData
        });

    // } catch(err) {
    //     console.log(err);
    // };
});

module.exports = router;