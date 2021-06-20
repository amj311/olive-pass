module.exports = {
  Colors: {
    Primary: "rgb(100, 212, 28)"
  },
  EmailCodeLength: 6,
  EmailCodeExpiration: 60000 * 60 * 1, // 1 hour
  SessionDuration: 60000 * 60 * 24, // 1 day
  PasswordRegex: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{6,20})/,
  EmailRegex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
}