const NodeRSA = require('node-rsa');

exports.signPayload = async(req, res, next) => {

    const privateKeyHyperBeta = `-----BEGIN RSA PRIVATE KEY-----
    MIIEpQIBAAKCAQEA2R+5+b1…………………./Og6ZnFHJn3BvQM/DWPg=
    -----END RSA PRIVATE KEY-----`      // This is a sample snippet. Always store and fetch the private key from crypto vault

    const privateKey = `kMqm40OtVN1VYaNmphdKqi2JgBqWRHhr0hs+Vv2Ue/bjA3WC22/59UUtJibh0/yI
    22F/H2JxM7WUi58OIs6Bq/Ok6Ozmv4qz85FSE7fn21MxvlD3B73uGkhw92avFpJT
    bMZ67SU4d5qcA8K9fkJ6IndObXSEZoM3b2MTjfQ88/rZwAUUVOE4gW1i2KagejK4
    /prSVfgvvmlCGIaI8oSPVipl+EQmcnlsLjjy3l7Yskm1WnwjAgFsG9DpF1PiGBfZ
    s+TTIfEnY4SgNvpSRAWHhAPiYG4LiTGEoePZBE8mkVngvr6LPwCkrIMJRk0+gBL6
    yMGM+wJN+Fj1Q8gdITVdXeKSDC1IG5eZGtk0Cds3T6/mgbQehJK0W7z+7uVUNhVI
    iWDlaW9QA+yJGz7GGiHgYOOOaCYUgjGW7xsrzOOWnHzeIuJ/YCfLILV3a9j2i4/z
    tRk/MceSHyqZpoVCO+aRjcvoKOjQ793pTn7trMz5v58oDzciOJM4pZDHAXtPsnFw
    /h1MNCSox30vPzEvy11iH0qz0UpV4y1guEG4hXXivErpnyeIETR97JviZt2LHmYL
    mADs04P8oUqF0hAPdg/eVdk1itE3uWLds3UoiOsOaiLR6lmWYGRsh6O7Bc65EaQK
    VGo8+0SYsffSTR17yNOVXc6XGg6g/PdPqARNYFKZ/h4DEtckWNRSvGvns+mnEj7Z
    HVmivMzEvS4yI2lP5fiQXaRf6YyTpQznueHUVP9vPqg8oiQRvh0oRyGdZt6ZadO6
    zuD943aNpu7+jAvp8n+BnnVnPL+sCjdAYTVtqP+dTCNEvRoInCP6ztras18sxM53
    4fxy7x+9FKS7Y55oqbFbhtK1uybVyeg81k4rZdHX95Cq2MIhHqPryi+fU5sqhIRL
    3/lNnJ/VfI1aisE+vs4fd4kT5/0PWuaAz5Xu/EjuAX061Me1Dy2f2EYDEHNV9ypl
    YUmZk7ZZYVZynDl2vyNGp8OkwB9ACfRqLpdWWz+7JCXPqsY3Dam9Q2P23f85ZIyk
    E+aH4WKWt6f4HLzIq7biw+BTuXHEg03VTMhEIfjxtUr0Bq07pLIqtxWN9SnNhxLi
    ggl5SwQE/Tvwlh+PsUGyVAu94AABCpfWLuJrS5gRM9KtqLv6u669ZYQ+U5pA1haX
    1cg8BYX+p9HU98GGx4SGEHuQUl27EZkrqjGZwoEGufLi9DhNwNIWtav59E1zJ4SU
    s107uJrlA7MEV5MclPb0gVOFVwl6ZgBLwdNpPWVy/3nt1QYymwm/UySmmkWyhG7Z
    KjMmECshRbeOpkRkqS0r6qieZJgp+zagIwkNkaAVpwSsr+RUGQGTl0c8nsY9Yh2o
    QliPZ2efQKgVQC2MiTbVUFKY+yVsX/DwOTF94eU1PmOmokk8xgR1Z4FqsWxDPXUh
    9N7HlK0mcU1rapn3b0RnreV6J52b09a8kZ4MFgATzs9LsqWH9J+i7nMKCs0iVv7z
    CHTmoGxknHz13IPOOTk0SI2fMjDdS+vc5ZOVjgH71jAnOzDBVqZjYZiQvMuHOCjM
    PgbvQcMIww1HKXwnZTAjbr88ZD+TYFJri8lEtOPXqWA+Wb5rkmKcKw==`
    const key = {b: 512}

    const payload = "{url: sdfef, check:test}"
    const encryptKey = new NodeRSA(key);
    var result = encryptKey.sign(payload,'base64','utf8');
    console.log(result);

    res.json({
        message : result
    })
}