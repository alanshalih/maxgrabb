module.exports = {
  /**
   * Serializes number status object
   * @param {*} obj
   */
  _serializeNumberStatusObj: (obj) => {
    if (obj == undefined) {
      return null;
    }

    return Object.assign({}, {
      id: obj.jid,
      status: obj.status,
      isBusiness: obj.biz === true,
      canReceiveMessage: obj.status === 200,
    });
  }
}