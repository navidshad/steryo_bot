var get = function(filepath, calbk)
{
    var mm = global.fn.musicmetadataModule
    var readableStream = global.fn.fs.createReadStream(filepath);
    return new Promise((resolve, reject) => 
    {
        mm(readableStream, function (err, metadata) 
        {
            if (err) {
                console.log(err);
                reject(err);
            }

            readableStream.close();
            if(calbk) calbk(metadata);
            resolve(metadata);
        });
    });
}
module.exports = {
    get,
}