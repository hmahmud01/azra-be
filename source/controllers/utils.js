exports.signPayload = async(req, res, next) => {
    const privateKeyHyperBeta = `-----BEGIN RSA PRIVATE KEY-----
    MIIEpQIBAAKCAQEA2R+5+b1…………………./Og6ZnFHJn3BvQM/DWPg=
    -----END RSA PRIVATE KEY-----`      // This is a sample snippet. Always store and fetch the private key from crypto vault
    const payload = "{url: sdfef, check:test}"
    const encryptKey = new NodeRSA(privateKeyHyperBeta);
    var result = encryptKey.sign(payload,'base64','utf8');
    console.log(result);
}