var chai = require('chai');
var sinon = require('sinon');
var rewire = require('rewire');
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

var expect = chai.expect;
var assert = chai.assert;

var sampleData = {
  Contents: [
      {
          Key: 'file1.mp4',
          bucket: 'my-bucket'
      },
      {
          Key: 'file2.mp4',
          bucket: 'my-bucket'
      }
  ]
};

describe('LambdaFunction', function() {

    var listObjectStub, callbackSpy, module;

    describe('#execute', function() {

        before(function(done) {
            listObjectStub = sinon.stub().yields(null, sampleData);
            callbackSpy = sinon.spy();

            var callback = function(error, result) {
                callbackSpy.apply(null, arguments);
                done();
            };

            module = getModule(listObjectStub);
            module.handler(null, null, callback)
        });

        it('should run our function once', function() {
            expect(callbackSpy).has.been.calledOnce;
        });

        it('should have correct results', function() {

            var result = {
                "baseUrl": "https://s3.amazonaws.com",
                "bucket": "serverless-video-transcoded",
                "urls": [
                    {
                        "Key": sampleData.Contents[0].Key,
                        "bucket": "my-bucket"
                    },
                    {
                        "Key": sampleData.Contents[1].Key,
                        "bucket": "my-bucket"
                    }
                ]
            };

            assert.deepEqual(callbackSpy.args, [[null, result]]);
        })
    })
});

function getModule(listObjects) {
    var rewired = rewire('../index.js');

    rewired.__set__({
        's3': { listObjects: listObjects},
        'process.env.BASE_URL': "https://s3.amazonaws.com",
        'process.env.BUCKET': "serverless-video-transcoded"
    });

    return rewired;
}