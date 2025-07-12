const { Sequelize, DataTypes } = require('sequelize');

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD; // Change this
const dbHost = process.env.DB_HOST;
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'mysql',
    logging: false, 
});

const MenuItem = sequelize.define('MenuItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    day_of_week: {
        type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        allowNull: false,
    },
    meal_type: {
        type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner'),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
}, {
    timestamps: true,
});

const PurchasedCoupon = sequelize.define('PurchasedCoupon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customer_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    customer_phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    meal_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    meal_type: {
        type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Used', 'Expired', 'Pending'),
        defaultValue: 'Pending',
        allowNull: false,
    },
    payment_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    order_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
});

module.exports = {
    sequelize,
    MenuItem,
    PurchasedCoupon,
};

