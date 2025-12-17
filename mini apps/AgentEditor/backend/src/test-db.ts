import prisma from './db/client.js'

async function test() {
  try {
    console.log('Testing database connection...')
    const count = await prisma.conversation.count()
    console.log('✅ Database works! Conversations:', count)
    
    console.log('\nTrying to create a conversation...')
    const conv = await prisma.conversation.create({
      data: { title: 'Test Conversation' }
    })
    console.log('✅ Created conversation:', conv.id)
    process.exit(0)
  } catch (error) {
    console.error('❌ Database error:', error)
    process.exit(1)
  }
}

test()
