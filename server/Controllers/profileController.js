require("dotenv").config();
const axios = require("axios"),
  { RAPID_API_KEY } = process.env;

module.exports = {
    //will get zipcodes by your criteria
  getPotentialsByZip: async (req, res) => {
      let db = req.app.get('db')
      let data = []
      let newData
    const { users_id, users_zipcode, users_preference_proximity_max, users_gender_male, users_age, users_age_preference_min, users_age_preference_max, users_gender_preference_standard} = req.session.user;
    try {
        console.log(users_zipcode, users_preference_proximity_max)
      const zipData = await axios({
        method: "get",
        url: `https://redline-redline-zipcode.p.rapidapi.com/rest/radius.json/${users_zipcode}/${users_preference_proximity_max}/miles`,
        headers: {
          "x-rapidapi-host": "redline-redline-zipcode.p.rapidapi.com",
          "x-rapidapi-key": RAPID_API_KEY
        }
      });
    //   console.log('zipdata', zipData)
      data = zipData.data.zip_codes
      newData = data.map(el => el.zip_code)
      let matches = await db.users_profile.find({users_zipcode: newData, "users_id <>": users_id })
    //   console.log('matches', matches)
      let bestMatches = matches.filter((el,i) => {
          return el.users_gender_male === users_gender_preference_standard && el.users_gender_preference_standard === users_gender_male && el.users_age >= users_age_preference_min && el.users_age <= users_age_preference_max
      })
    //   console.log('bestMatches', bestMatches)
      res.status(200).send(bestMatches);
    }
    catch(err){
        res.status(500).send(err)
    }
    // console.log("data", newData)
  }
};
//iterate over the zipData and have it return just the zipcode, then either individually insert into the zipcode table or find massives way to do a bulk insert into the zipcode table

