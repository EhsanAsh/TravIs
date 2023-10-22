/* eslint-disable indent */
// Desc: This file will handle all the get routes for trips
// =============================================================

// Dependencies, Models
// =============================================================
const router = require('express').Router();
const { Trip, TripSection, ItineraryItem } = require('../models');
const loginAuth = require('../utils/auth');
// =============================================================

// Get one trip with all associated trip sections and itinerary items
// =============================================================
router.get('/view/:id', loginAuth, async (req, res) => {
    try {
        // Retrieve the trip with the specified ID and include its sections and items
        const trip = await Trip.findByPk(req.params.id, {
            include: [
                {
                    model: TripSection,
                    as: 'sections',
                    include: [
                        {
                            model: ItineraryItem,
                            as: 'items',
                        },
                    ],
                },
            ],
        });

        // Check if the trip exists
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Initialize the data structure
        const responseData = {
            id: trip.id,
            title: trip.title,
            start_date: trip.start_date,
            end_date: trip.end_date,
            image: trip.image,
            sections: [],
        };

        // Iterate through sections and items to categorize them
        trip.sections.forEach((section) => {
            const categorizedItems = {
                accommodationItems: [],
                foodItems: [],
                transportItems: [],
                activityItems: [],
                miscItems: [],
            };

            section.items.forEach((item) => {
                switch (item.category) {
                    case 'Accommodation':
                        categorizedItems.accommodationItems.push(item);
                        break;
                    case 'Food':
                        categorizedItems.foodItems.push(item);
                        break;
                    case 'Transportation':
                        categorizedItems.transportItems.push(item);
                        break;
                    case 'Activities':
                        categorizedItems.activityItems.push(item);
                        break;
                    default:
                        categorizedItems.miscItems.push(item);
                        break;
                }
            });

            // Add the categorized items to the response
            responseData.sections.push({
                id: section.id,
                title: section.title,
                ...categorizedItems,
            });
        });

        // Send the response
        res.render('view-itinerary', {
            layout: 'main',
            trip: responseData,
            loggedIn: req.session.loggedIn,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// =============================================================

// Export router
// =============================================================
module.exports = router;
