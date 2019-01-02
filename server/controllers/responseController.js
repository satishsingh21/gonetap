let response = {
    status: 200,
    data: [],
    message: null
};

function sendError(err, res) {
    response.data = [];
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

function sendResponse(data, res) {
    response.data = data;
    response.status = 200;
    response.message = null;
    res.json(response);
};

module.exports = {
    sendError,
    sendResponse
};