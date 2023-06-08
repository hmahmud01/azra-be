const NodeRSA = require('node-rsa');

exports.signPayload = async (req, res, next) => {

    const privateKeyHyperBeta = `-----BEGIN RSA PRIVATE KEY-----
    MIIEpQIBAAKCAQEA2R+5+b1…………………./Og6ZnFHJn3BvQM/DWPg=
    -----END RSA PRIVATE KEY-----`     
    const privateKeyHyperBeta2 = `-----BEGIN RSA PRIVATE KEY-----
    MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAKFGcFcRtE+sZ7aYBuWL1/X/FVPkNwiTifXWK7TqS92XRYlUE8Lvdx1UPXDpzjGMlWRZgdKybsNTYyWDfyPlOkWc1s9b6IgS5E13QVhPF2FSnICi9kgq76bG5NBpJpMoiuZ0yf/YHWjYr9T0fGD58DSe0Nszo9l7wfcNu3r3eRXxAgMBAAECgYAEWYbro5evo23WVqeETD8vob40mZ3jXmlU5v5y83PG3vmE5e6KLipnW9o0CquhRKeogc0sKTGuv80XhKz/7e2M9U2ZjHm3NtiAUfsdhyxvIQPoGIlrrYdM+X6dEClHeZ0az+CDyrgeOfInkZB9iDTtmov/q777gi6IIIpBRh7pXQJBAM59f5yEVRD10dtr3V2MDd+TbPVKLOPtA/NoOwbc5zSLpRoc4f9PUgS9s6+36Z4LXwYEz9qLRHNMG4+igah9Vz0CQQDH8Zw1DVJd1N9BNBbohZ8nnzOlV5dLvpn5C5t8xC22bry9iTwIx/dFDTL3cYyDCkOo28BEKGqS7LHCSBIayATFAkEApEbNvoy9TIf1FDcFXwYsh2G3fpIrko2e5ghXZYdbXb93c4Xk+oR1gRYXHUYY00bCq3wqjPjdVUkIaEZmFtDZFQJBAK3fzpfUHey7UerCAanziZRLPf5rTYbxGbUaAv1dHOOpKTkqPqrkOoQyFkBY3niWVIBjma+r9gIPFAZ/5j6j8oECQQCHQncopbo3gE9ZUD0QFMAbz+L3fSJ/eX3A47t6IoF5wJWYUCKoenLwydowSpusDEftyaaMahn6NIQrxZkgk/7C
    -----END RSA PRIVATE KEY-----` 
    const privateKey = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAKFGcFcRtE+sZ7aYBuWL1/X/FVPkNwiTifXWK7TqS92XRYlUE8Lvdx1UPXDpzjGMlWRZgdKybsNTYyWDfyPlOkWc1s9b6IgS5E13QVhPF2FSnICi9kgq76bG5NBpJpMoiuZ0yf/YHWjYr9T0fGD58DSe0Nszo9l7wfcNu3r3eRXxAgMBAAECgYAEWYbro5evo23WVqeETD8vob40mZ3jXmlU5v5y83PG3vmE5e6KLipnW9o0CquhRKeogc0sKTGuv80XhKz/7e2M9U2ZjHm3NtiAUfsdhyxvIQPoGIlrrYdM+X6dEClHeZ0az+CDyrgeOfInkZB9iDTtmov/q777gi6IIIpBRh7pXQJBAM59f5yEVRD10dtr3V2MDd+TbPVKLOPtA/NoOwbc5zSLpRoc4f9PUgS9s6+36Z4LXwYEz9qLRHNMG4+igah9Vz0CQQDH8Zw1DVJd1N9BNBbohZ8nnzOlV5dLvpn5C5t8xC22bry9iTwIx/dFDTL3cYyDCkOo28BEKGqS7LHCSBIayATFAkEApEbNvoy9TIf1FDcFXwYsh2G3fpIrko2e5ghXZYdbXb93c4Xk+oR1gRYXHUYY00bCq3wqjPjdVUkIaEZmFtDZFQJBAK3fzpfUHey7UerCAanziZRLPf5rTYbxGbUaAv1dHOOpKTkqPqrkOoQyFkBY3niWVIBjma+r9gIPFAZ/5j6j8oECQQCHQncopbo3gE9ZUD0QFMAbz+L3fSJ/eX3A47t6IoF5wJWYUCKoenLwydowSpusDEftyaaMahn6NIQrxZkgk/7C"
    // const key = { b: 512 }
    const pos_id = "1264055921"
    const secret = "BLOOMMNP202208"
    const merchant_id = "7794799606"
    const msisdn = 564891
    const amount = 10
    let d = Date(Date.now())
    let a = d.toString()

    const data= '{\"destMsisdn\:"971'+msisdn+ '\",\"amount\":'+ amount +'}'

    console.log("normalized data: ", data);

    const datt = "POST/restcon/rest/pos" + pos_id + "/topup/" + data + "secretWord=" + secret + "api-request-merchantid" + merchant_id + "api-request-timestamp" + a
    console.log(`requested data for payload sign : ${datt}`)

    const payload = {
        "payload": datt,
        "private_key": privateKey
    }
    // const encryptKey = new NodeRSA(privateKeyHyperBeta2);
    const key = new NodeRSA();
    const signer = key.importKey(privateKeyHyperBeta2, 'pkcs12-private-pem');
    var result = signer.sign(payload, 'base64', 'utf8');
    console.log(result);

    res.json({
        message: result
    })
}