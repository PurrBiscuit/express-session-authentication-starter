const { randomBytes, pbkdf2Sync } = require('crypto');

const isPasswordValid = (password, hash, salt) => {
  const passwordHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return passwordHash === hash
}

const genPassword = password => {
  const salt = randomBytes(32).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')

  return {
    salt,
    hash
  }
}

module.exports.isPasswordValid = isPasswordValid
module.exports.genPassword = genPassword
