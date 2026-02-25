import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
    console.log("🗳️  CHECKING VOTE COUNTS");
    console.log("=======================");
    
    // Contract address (update this with your deployed contract)
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    // Get contract instance
    const SecureVoting = await ethers.getContractFactory("SecureVoting");
    const contract = SecureVoting.attach(contractAddress);
    
    try {
        // Get total votes
        const totalVotes = await contract.totalVotes();
        console.log(`📊 Total Votes Cast: ${totalVotes.toString()}`);
        
        console.log("\n🏛️  PARTY VOTE COUNTS:");
        console.log("---------------------");
        
        // List of parties from your system
        const parties = ['party-1', 'party-2', 'party-3', 'party-4', 'party-5', 'party-6', 'party-7', 'party-8'];
        const partyNames = ['BJP', 'Congress', 'AAP', 'AITC', 'BSP', 'SP', 'CPI(M)', 'Shiv Sena'];
        
        let results = [];
        
        for (let i = 0; i < parties.length; i++) {
            const party = parties[i];
            const partyName = partyNames[i];
            
            // Generate party hash (same way as frontend)
            const partyHash = ethers.keccak256(ethers.toUtf8Bytes(party));
            
            // Get vote count for this party
            const voteCount = await contract.getVoteCount(partyHash);
            
            results.push({
                party: partyName,
                id: party,
                votes: voteCount.toString(),
                hash: partyHash
            });
            
            console.log(`${partyName} (${party}): ${voteCount.toString()} votes`);
        }
        
        console.log("\n🏆 RESULTS SUMMARY:");
        console.log("-------------------");
        
        // Sort by vote count (highest first)
        results.sort((a, b) => parseInt(b.votes) - parseInt(a.votes));
        
        results.forEach((result, index) => {
            const position = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            console.log(`${position} ${result.party}: ${result.votes} votes`);
        });
        
        // Show winner
        if (results.length > 0 && parseInt(results[0].votes) > 0) {
            console.log(`\n🎉 LEADING PARTY: ${results[0].party} with ${results[0].votes} votes`);
        } else {
            console.log("\n📭 No votes cast yet");
        }
        
    } catch (error) {
        console.error("❌ Error checking votes:", error.message);
        
        if (error.message.includes("call revert exception")) {
            console.log("\n💡 Make sure:");
            console.log("1. Ganache is running on port 8545");
            console.log("2. Contract is deployed at the correct address");
            console.log("3. You're connected to the right network");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });