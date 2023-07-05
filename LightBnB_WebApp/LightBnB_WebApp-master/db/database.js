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
const getUserWithEmail = function(email) {
  return pool.query(`SELECT * FROM users WHERE email = $1`, [email])
    .then(res => {
      if (res.rows.length === 0) {
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
const getUserWithId = function(id) {
  return pool.query(`SELECT * FROM users WHERE id = $1`, [id])
    .then(res => {
      if (res.rows.length === 0) {
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
const addUser = function(user) {
  const userId = Object.keys(users).length + 1;
  user.id = userId;
  users[userId] = user;

  return pool.query(`INSERT INTO users (
    name, email, password) 
    VALUES (
    $1, $2, $3) RETURNING *;`, [user.name, user.email, user.password])
    .then(res => {
      if (res.rows.length === 0) {
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
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`SELECT properties.* 
  FROM properties 
  JOIN reservations ON properties.id = property_id 
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id , properties.id
  ORDER BY reservations.start_date
  LIMIT $2;`, [guest_id, limit])
    .then(res => {
      if (res.rows.length === 0) {
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
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  let queryString = `Select properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id`;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += ` WHERE city LIKE $${queryParams.length}`;
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += ` WHERE owner_id = $${queryParams.length}`;
  }

  if(queryParams.length != 0 && options.minimum_price_per_night && options.maximum_price_per_night){
    queryParams.push(`${options.minimum_price_per_night * 100.0}`);
    queryParams.push(`${options.maximum_price_per_night * 100.0}`);
    queryString += ` AND cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length}`; 
  }  else if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100.0}`);
    queryParams.push(`${options.maximum_price_per_night * 100.0}`);
    queryString += ` WHERE cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length}`;
  } else if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100.0}`);
    queryString += ` WHERE cost_per_night <= $${queryParams.length}`;
  } else if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100.0}`);
    queryString += ` WHERE cost_per_night >= $${queryParams.length}`;
  }

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` GROUP BY properties.id HAVING AVG(property_reviews.rating) >= $${queryParams.length}`;
  } else {
    queryString += ` GROUP BY properties.id`;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};`;
  return pool.query(queryString, queryParams)
    .then((res) => {
      return res.rows
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  // return Promise.resolve(property);
  const values = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
    property.country,
    property.street,
    property.city,
    property.province,
    property.post_code,
    true,
  ];

  return pool.query(`INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active)
  VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;`, values)
    .then(res => {
      if (res.rows.length === 0) {
        return null;
      }
      return res.rows[0];
    })
    .catch(err => console.error('query error', err.stack));
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
