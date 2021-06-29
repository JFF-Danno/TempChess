import React, { Component } from 'react'
import { HashRouter,BrowserRouter, Switch, Route } from 'react-router-dom'
//import { TransitionGroup, Transition } from "react-transition-group";


import Deploy from "./Deploy";
import Profile from "./UserProfile";
import Wallet from "./Wallet";
import NFTView from "./NFTView";
import Minter from "./Minter";
import Admin from "./Admin";
import Store from "./Store";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="app">
         

<Route render={({location}) => 
{
    const { pathname, key } = location
       
    return (

       

                <Switch location={location}>
                    <Route exact path="/"   component={Store}          />
                    <Route path="/deploy"   component={Deploy}          />
                    <Route path="/profile"  component={Profile}         />
                    <Route path="/wallet"     component={Wallet}     />
                    <Route path="/store"     component={Store}     />

                    <Route path="/nftview"  component={NFTView}         />
                    <Route path="/mint"     component={Minter}          />
                    <Route path="/admin"     component={Admin}          />
                </Switch>

          )
}} />

        </div>
      </BrowserRouter>
    )
  }


}


export default App;



