import { getCliClient } from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})

async function main() {
  console.log('Patching order...');
  await client.patch('achieve-hackathon-finalist').set({order: 1}).commit();
  await client.patch('achieve-apertre-mentor').set({order: 2}).commit();
  await client.patch('achieve-mckinsey-forward').set({order: 3}).commit();
  await client.patch('achieve-kaggle-days-dncr').set({order: 4}).commit();
  await client.patch('achieve-openai-dev-event').set({order: 5}).commit();
  await client.patch('achieve-hackathon-organizer').set({order: 6}).commit();
  console.log('Done patching orders!');
}

main().catch(console.error);
