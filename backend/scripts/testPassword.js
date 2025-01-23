import bcrypt from 'bcrypt';

async function testPassword() {
  const password = 'admin';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash:', hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Is valid:', isValid);
}

testPassword();
