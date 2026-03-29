import bcrypt from 'bcryptjs';

async function test() {
    const password = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Hash:', hash);
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Match:', isMatch);
    
    // Test with a hardcoded hash that might have been generated elsewhere if we knew it.
}

test();
