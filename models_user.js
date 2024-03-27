const {
Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
        }
    }

    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true,
            allowNull: false,
            unique: true,
            noUpdate: true,
            readOnly: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            writeOnly: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        token: {
            type: DataTypes.STRING,
                // allowNull: true,
                unique: true,
        },
        expiryTime: {
            type: DataTypes.DATE,
        },
        verified: {
            type: DataTypes.STRING,
                allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'User',
        timestamps: true,
        defaultScope: {
        attributes: { exclude: ["password", "token"] },
        },

        createdAt: 'account_created',
        updatedAt: 'account_updated'
    });

    return User;
};