const bcrypt = require("bcryptjs");
const saltRounds = 8;
const validation = require("../publicMethods");
const db = require("../config/mongoCollection");
// const animaldb = require("./animalData");
const { ObjectId } = require("mongodb");

/**
 *
 * @param {String} username - create username
 * @param {String} password - create password
 * @param {String} firstName - create user first name
 * @param {String} lastName - create user last name
 * @returns - return {insertedUser: true}
 */
const createUser = async (username, password, firstName, lastName) => {
  // // check first name
  // firstName = validation.checkName(firstName, "firstName");
  // // check last name
  // lastName = validation.checkName(lastName, "lastName");
  // // check username
  // username = validation.usernameValidation(username);
  // // check password
  // password = validation.passwordValidation(password);

  const userdb = await db.userCollection();
  const checkUserExist = await userdb.findOne({ username: username });
  if (checkUserExist)
    throw "Could not add this user: already have this user in database";

  const passwordAfterHash = await bcrypt.hash(password, saltRounds);
  const userData = {
    user_account: username,
    user_password: passwordAfterHash,
    first_name: firstName,
    last_name: lastName,
    animal_ids: [],
    volunteer_ids: [],
    follow_animal_ids: [],
    comment_ids: [],
  };
  // add to db
  const info = await userdb.insertOne(userData);
  let user_id = info.insertedId.toString();
  if (!info.acknowledged || !info.insertedId) throw "Could not add this user";
  return { insertedUser: true, userid: user_id };
};

/**
 *
 * @param {String} username - check username
 * @param {String} password - check password
 * @returns - { authenticatedUser: true }
 */

const checkUser = async (username, password) => {
  // username = validation.usernameValidation(username);
  // password = validation.passwordValidation(password);
  const userdb = await db.userCollection();
  const checkUserExist = await userdb.findOne({ user_account: username });
  if (!checkUserExist) throw "Either the username or password is invalid";
  const comparePassword = await bcrypt.compare(
    password,
    checkUserExist.user_password
  );
  if (comparePassword == false)
    throw "Either the username or password is invalid";
  else return { authenticatedUser: true };
};

const updateUser = async (username, password, firstName, lastName) => {
  const userdb = await db.userCollection();
  const updatedInfo = await userdb.updateOne(
    { user_account: username },
    {
      $set: {
        user_password: password,
        first_name: firstName,
        last_name: lastName,
      },
    }
  );
};

const getAnimalList = async (username) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ user_account: username });
  if (!User) throw `${username} is not exist`;
  return User.animal_ids;
};

const getUserData = async (username) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ user_account: username });
  if (!User) throw `${username} is not exist`;
  // console.log(User);
  User._id = User._id.toString();
  return User;
};
const getUserById = async (userid) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ _id: ObjectId(userid) });
  if (!User) throw `can not find user with id of ${userid}`;
  // console.log(User);
  User._id = User._id.toString();
  return User;
};

const putAnimalIn = async (animalid, userid) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ _id: ObjectId(userid) });
  let animalidList = User.animal_ids;
  animalidList.push(animalid);
  const updateinfo = await userdb.updateOne(
    { _id: ObjectId(userid) },
    { $set: { animal_ids: animalidList } }
  );
  if (!updateinfo) {
    throw "can not put animal in user";
  }
  return true;
};

const removeAnimalFromU = async (animalid, userid) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ _id: ObjectId(userid) });
  let animalidList = User.animal_ids;
  for (let index = 0; index < animalidList.length; index++) {
    const element = animalidList[index];
    if (element == animalid) {
      animalidList.splice(index, 1);
    }
  }
  const updateinfo = await userdb.updateOne(
    { _id: ObjectId(userid) },
    { $set: { animal_ids: animalidList } }
  );
  return true;
};

const putCommentIn = async (commentid, userid) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ _id: ObjectId(userid) });
  let commenidtList = User.comment_ids;
  commenidtList.push(commentid);
  const updateinfo = await userdb.updateOne(
    { _id: ObjectId(userid) },
    { $set: { comment_ids: commenidtList } }
  );
  if (!updateinfo) {
    throw "can not put comment in user";
  }
  return true;
};

const removeCommentFromU = async (commentid, userid) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ _id: ObjectId(userid) });
  let commenidtList = User.comment_ids;
  for (let index = 0; index < commenidtList.length; index++) {
    const element = commenidtList[index];
    if (element == commentid) {
      commenidtList.splice(index, 1);
    }
  }
  const updateinfo = await userdb.updateOne(
    { _id: ObjectId(userid) },
    { $set: { comment_ids: commenidtList } }
  );
  if (!updateinfo) {
    throw `Could not remove commentid in user ${userid}`;
  }
  return true;
};
const removeVolunteerFromU = async (volunteerid, userid) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ _id: ObjectId(userid) });
  let volunteeridtList = User.volunteer_ids;
  for (let index = 0; index < volunteeridtList.length; index++) {
    const element = volunteeridtList[index];
    if (element == volunteerid) {
      volunteeridtList.splice(index, 1);
    }
  }
  const updateinfo = await userdb.updateOne(
    { _id: ObjectId(userid) },
    { $set: { volunteer_ids: volunteeridtList } }
  );
  if (!updateinfo) {
    throw `Could not remove volunteerid in user ${userid}`;
  }
  return true;
};
const putVolunteerIn = async (Vollunteerid, userid) => {
  const userdb = await db.userCollection();
  const User = await userdb.findOne({ _id: ObjectId(userid) });
  let VollunteeridtList = User.volunteer_ids;
  VollunteeridtList.push(Vollunteerid);
  const updateinfo = await userdb.updateOne(
    { _id: ObjectId(userid) },
    { $set: { volunteer_ids: VollunteeridtList } }
  );
  if (!updateinfo) {
    throw "can not put volunteer in user";
  }
  return true;
};

const removeUserById = async (userid) => {
  const userdb = await db.userCollection();
  const user = await userdb.findOne({ _id: ObjectId(userid) });
  if (!user) {
    throw "This user is not exist";
  }
  const deletionInfo = await userdb.deleteOne({ _id: ObjectId(userid) });
  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete user with id of ${userid}`;
  }
  return `The user ${user._id} has been successfully deleted!`;
};

module.exports = {
  createUser,
  checkUser,
  getAnimalList,
  putAnimalIn,
  putVolunteerIn,
  getUserData,
  updateUser,
  putCommentIn,
  removeUserById,
  getUserById,
  removeCommentFromU,
  removeAnimalFromU,
  removeVolunteerFromU,
};
