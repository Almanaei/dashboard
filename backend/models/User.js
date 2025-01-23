import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  hooks: {
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = User.hashPassword(user.password);
      }
    },
    beforeCreate: async (user) => {
      user.password = User.hashPassword(user.password);
    }
  }
});

// Instance method to check password
User.prototype.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// Static method to hash password
User.hashPassword = function(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export default User;
