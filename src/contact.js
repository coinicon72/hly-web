// @flow

import React, { Component } from 'react';

import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';

import { Button, Card, CardBody, CardImage, CardTitle, CardText, Fa } from 'mdbreact';

export default () => {
  return (
    <div className="container">
  <Card>
      <CardImage className="img-fluid" src="https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20%282%29.jpg" />
      <CardBody>
          <CardTitle>Card title</CardTitle>
          <CardText>Some quick example text to build on the card title and make up the bulk of the card's content.</CardText>
          <Button href="#">Button</Button>
      </CardBody>
  </Card>
                        
  </div>
  )
}