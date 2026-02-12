import Gun from 'gun/gun';
import 'gun/sea';
import 'gun/axe';

// Initialize Gun with a public relay peer (or local/browser storage only if peers fail)
// For a production app, you'd want reliable peers. For this demo, we'll try to use some public ones 
// or just rely on local storage + potential default gun peers.
const gun = Gun({
    peers: [
        'https://gun-manhattan.herokuapp.com/gun', // Common public peer, might be flaky
        // 'http://localhost:8765/gun' // Local peer if running one
    ],
    localStorage: true
});

// Helper to get the leaderboard node
export const getLeaderboard = () => {
    return gun.get('aegis_presale_v1').get('leaderboard');
};

// Helper to get user data
export const getUserData = (address) => {
    if (!address) return null;
    return gun.get('aegis_presale_v1').get('users').get(address.toLowerCase());
};

// Helper to update leaderboard score
// In a real app, this should be verified by a backend or smart contract event to prevent cheating.
// For this demo, we trust the client (insecure but functional for "fun").
export const updateLeaderboardScore = (address, scoreDelta) => {
    if (!address) return;
    const userNode = getUserData(address);

    userNode.get('score').once((currentScore) => {
        const newScore = (currentScore || 0) + scoreDelta;
        userNode.put({ score: newScore, address: address });

        // Also update a simple list for the leaderboard rendering
        // Gun is a graph, so "ordering" is tricky. We'll just store users in a set 
        // and let the client sort them.
        getLeaderboard().set(userNode);
    });
});
};

// Helper to record a referral
export const recordReferral = (newUserAddress, referrerAddress) => {
    if (!newUserAddress || !referrerAddress || newUserAddress.toLowerCase() === referrerAddress.toLowerCase()) return;

    const userNode = getUserData(newUserAddress);

    // Check if user already has a referrer
    userNode.get('referredBy').once((existingReferrer) => {
        if (!existingReferrer) {
            // Set the referrer
            userNode.get('referredBy').put(referrerAddress);

            // Increment referrer's score (1 invite = 1 point for now)
            updateLeaderboardScore(referrerAddress, 1);

            console.log(`Referral recorded: ${newUserAddress} invited by ${referrerAddress}`);
        }
    });
};

export default gun;
