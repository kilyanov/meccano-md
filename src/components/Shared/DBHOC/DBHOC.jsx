import React from 'react';

const DBHOC = (mapStateToProps) => Component => <Component {...mapStateToProps()} />;

export default DBHOC;
