const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool.query(`SELECT * FROM users WHERE email = $1`, [email])
  .then(res => {
    console.log(res.rows);
    if(res.rows.length === 0){
      return null;
    }
    return res.rows[0];
  }).catch(err => console.error('query error', err.stack));
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool.query(`SELECT * FROM users WHERE id = $1`, [id])
  .then(res => {
    console.log(res.rows);
    if(res.rows.length === 0){
      return null;
    }
    return res.rows[0];
  }).catch(err => console.error('query error', err.stack));

};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const userId = Object.keys(users).length + 1;
  user.id = userId;
  users[userId] = user;
  // return Promise.resolve(user);

  return pool.query(`INSERT INTO users (
    name, email, password) 
    VALUES (
    $1, $2, $3) RETURNING *;`, [user.name, user.email, user.password])
  .then(res => {
    if(res.rows.length === 0){
      return null;
    }
    return res.rows[0];
  })
  .catch(err => console.error('query error', err.stack));

};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool.query(`SELECT properties.* 
  FROM properties 
  JOIN reservations ON properties.id = property_id 
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id , properties.id
  ORDER BY reservations.start_date
  LIMIT $2;`, [guest_id, limit])
  .then(res => {
    if(res.rows.length === 0){
      return null;
    }
    return res.rows;
  })
  .catch(err => console.error('query error', err.stack));
  
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  return pool.query(`SELECT * FROM properties LIMIT $1`, [limit])
  .then(res => {
    console.log(res.rows);
    return res.rows;
  }).catch(err => console.error('query error', err.stack));
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
