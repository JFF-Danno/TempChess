import React, { useState } from "react";
import ReactDOM from "react-dom";
import {DefaultButton, PrimaryButton, DangerButton, BrandButton} from 'pivotal-ui/react/buttons';
import {Grid, FlexCol} from 'pivotal-ui/react/flex-grids';
import {Panel} from 'pivotal-ui/react/panels';
import {Divider} from 'pivotal-ui/react/dividers';
import {Image} from 'pivotal-ui/react/images';
import {Input} from 'pivotal-ui/react/inputs';
import {Modal} from 'pivotal-ui/react/modal';
import {Checkbox} from 'pivotal-ui/react/checkbox';
import {Radio, RadioGroup} from 'pivotal-ui/react/radio';
import { ContractFactory, ethers } from 'ethers'

import web3 from 'web3';

import logo from './logo.svg';
import './App.css';
import 'pivotal-ui/css/modal';
import moralis from "moralis";
import AddOrganzizerModal from './AddOrganizerModal';
import AddMinterModal from './AddMinterModal';



import MOLCOMMONS_ABI from './CONTROLLER_ABI'
import MOLVAULT_BYTECODE from './CONTROLLER_BYTECODE'

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const orgaddresses = [];
function App() {

        const initialUser = moralis.User.current();
        const [user, setUser] = useState(initialUser);
        const [clist, setList] = useState('');
        const [address, setAddress] = useState('Connect Wallet');
        const [chain, setChain] = useState('');
        const [connect, toggleConnect] = useState(false);
        const [organizer0, setOrganizer0] = useState('')
        const [confirmationsRequired, setConfirmationsRequired] = useState('')
        const [tokenName, setTokenName] = useState('')
        const [tokenSymbol, setTokenSymbol] = useState('')
        const [community, setCommunity] = useState('')
        const [communitySymbol, setCommunitySymbol] = useState('')
        const [nftName, setNftName] = useState('')
        const [commonsAddress, setCommonsAddress] = useState(null)
        const [usecase, setUseCase] = useState(null)
        const [transferable, setTransferable] = useState(false)
        const [deployError, setDeployError] = useState(null)
        const [message, setMessage] = useState('');
        const [orgs, setOrgs] = useState([]);
        const [minters, setMinters] = useState([]);
        const [orgRows, setOrgRows] = useState();
        const [minterRows, setMinterRows] = useState();
        const [minter0,     setMinter0] = useState();


  // ----- Smart Contract Config
  const provider = new ethers.providers.Web3Provider(window.ethereum)

      const signer = provider.getSigner();

      const factory = new ContractFactory(MOLCOMMONS_ABI, MOLVAULT_BYTECODE, signer)

        const Organizer = moralis.Object.extend( "Organizer", 
        {
          // Instance methods

        }, 
        {  
            newOrganizer: function(index) { 
                                        const organizer = new Organizer();
                                        organizer.set( "address",        document.getElementById( 'organizer' + index ).value.toLowerCase()  );
                                        return organizer; 
                                    }
        });
        
        const Minter = moralis.Object.extend( "Minter", 
        {
          // Instance methods

        }, 
        {  
            newMinter: function(index) { 
                                        const minter = new Minter();
                                        minter.set( "address",        document.getElementById( 'minter' + index ).value.toLowerCase()  );
                                        return minter; 
                                    }
        });


        //var contractAddress = '';
        const Commons = moralis.Object.extend( "Commons", 
        {
          // Instance methods

        }, 
        {  
            newCommons: function(contractAddress,gammaAddress) { 
                                        const commons = new Commons();
                                        commons.set( "name",            document.getElementById( 'commonsname'     ).value  );
                                        commons.set( "nftName",         document.getElementById( 'nftname'         ).value  );
                                        commons.set( "nftSymbol",       document.getElementById( 'commonssymbol'   ).value  );

                                        commons.set( "organizer",       document.getElementById( 'organizer0'      ).value.toLowerCase()  ); 

                                        commons.set( "confirmations",   document.getElementById( 'confirmations'   ).value  );
                                        commons.set( "contractAddress", contractAddress  );
                                        commons.set( "gammaAddress",    gammaAddress    );
                                        commons.set( "network",         chain           );
                                       
                                        var radios = document.getElementsByName( 'radio-group'   );                                 
                                        for (var i = 0; i < radios.length; i++) 
                                        {
                                            if ( radios[i].checked )
                                            {
                                               commons.set( "use",     radios[i].value  );
                                            }
                                        }
                                        return commons; 
                                    }
        });


        window.addEventListener( 'load', async function() { if (user) { await getNetwork();setUser(user);setAddress(user.get("ethAddress") ); }}) ;



const getNetwork = () => {
    provider
      .getNetwork()
      .then((network) => {
        console.log('current chainId - ' + network.chainId)
        if (network.chainId === 100) {
          setChain('xDAI')
          toggleConnect(true)
        } else if (network.chainId === 4) {
          setChain('Rinkeby') 
          toggleConnect(true)
        } else if (network.chainId === 1) {
          setChain('Mainnet')
          toggleConnect(true)
        } else if (network.chainId === 3) {
          setChain('Ropsten')
          toggleConnect(true)
        } else if (network.chainId === 42) {
          setChain('Kovan')
          toggleConnect(true)
        } else if (network.chainId === 80001) {
          setChain('Polygon')
          toggleConnect(true)
        } else {
          console.log('Pick a supported blockchain!')
        }
      })
      .catch((err) => {
        alert( 'err ' + err );
        console.log(err)
      })
  }

       const onLogin = async () => {                                        
                                        await getNetwork();
                                        const user = await moralis.authenticate();
                                        setUser(user);
                                        setAddress(user.get("ethAddress") );
                                   };

       const onLogout = () => {  moralis.User.logOut(); setUser(null); };



       const saveCommons = async (contractAddress) => {   

                                                        setMessage( 'Deployment Complete! Saving Data!' );
                                                        const _contract = new ethers.Contract(contractAddress, MOLCOMMONS_ABI, signer)
                                                        var gammaAddress;
                                                        try
                                                        {
                                                            gammaAddress = await _contract.gamma();
                                                            console.log('gamma ' + gammaAddress);
                                                        }
                                                        catch (e) { console.log(e) }
  
                                              const newCommons = Commons.newCommons(contractAddress,gammaAddress);
                                              await newCommons.save();  
                                              for ( var i = 0; i < 10; i++ )
                                              {
                                                  
                                                  if ( document.getElementById( 'organizer' + i ) != null )
                                                  {
                                                      const newOrganizer = Organizer.newOrganizer(i);
                                                      newOrganizer.set( "parentId", newCommons.id   );
                                                      newOrganizer.set( "parent",   newCommons      );
                                                      await newCommons.save( {child: newOrganizer}  );
                                                  }
                                                  if ( document.getElementById( 'minter' + i ) != null )
                                                  {
                                                      const newMinter = Minter.newMinter(i);
                                                      newMinter.set( "parentId", newCommons.id   );
                                                      newMinter.set( "parent",   newCommons      );
                                                      await newMinter.save();
                                                  }
                                              }
                                             document.getElementById( 'loading' ).style.display = 'none';
                                             window.location.href = "/heavenly-jungle/select";
                                       };




        
        

    const setUse = (useType) =>
    {
        setUseCase( useType );
        if ( useType == 'personal' )
        {
            document.getElementById('personal').checked = true
        }
        else
        {
            document.getElementById('community').checked = true
        }
    }

    const setTransferableField = (checked) =>
    {
        setTransferable(checked);
    }

    const checkDeployable = () =>
    {
        if ( community != '' && communitySymbol != ''  && confirmationsRequired != '' && usecase )
        {
            setMessage( 'Ready To Deploy! Waiting For Confirmation!' );
            document.getElementById( 'loading' ).style.display = 'block';
            deploy();
        }
        else
        {
            setMessage( 'Not deployable!' );
        }
    }


  // ----- Deploy MolVault
  const deploy = async () => {
    
    var gRoyaltiesUri   = '/';
    var organizer       = [];
    var minter          = [];
    for ( var i = 0; i < 10; i++ )
    {
        if ( document.getElementById( 'organizer' + i ) != null )
        {    
            organizer.push( document.getElementById( 'organizer' + i ).value );

        }
        if ( document.getElementById( 'minter' + i ) != null )
        {    
            minter.push( document.getElementById( 'minter' + i ).value );

        }
        
    }

    if (organizer.length > 0 && confirmationsRequired > 0) {
      try {
        const _contract = await factory.deploy(
          nftName,
          communitySymbol,
          gRoyaltiesUri,     
          organizer,
          minter,
          confirmationsRequired
        )

       _contract.deployTransaction
          .wait()
          .then((receipt) => {

            console.log('Receipt for deploying MolCommons', receipt)
            saveCommons(receipt.contractAddress);
            
            
            
          })
          .catch((e) => console.log(e))
      } catch (e) {
        console.log(e)
      }
    } else {
      setDeployError('You must enter owners and number of confirmations')
    }
  }

        const addOrgCallbackFunction = (newAddress) => {  
            
            orgs.push( newAddress );
            setOrgs(orgs);// uris.map((uri,index) => 
            setOrgRows( orgs.map((address,i) =>     
                                        <Grid  key={i} className="grid-show">
                                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                                          <FlexCol {...{style: {padding: '8px'}}} ><Input placeholder="Organizer" id={'organizer' + ( i  ) } type="text" defaultValue={address} /></FlexCol>
                                          <FlexCol className=" txt-l"></FlexCol>
                                        </Grid>)
                       );

         }

        const addMinterCallbackFunction = (newAddress) => {  
            
            minters.push( newAddress );
            setMinters(minters); 
            setMinterRows( minters.map((address,i) =>     
                                        <Grid  key={i} className="grid-show">
                                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                                          <FlexCol {...{style: {padding: '8px'}}} ><Input placeholder="Minter" id={'minter' + ( i  )} type="text" defaultValue={address} /></FlexCol>
                                          <FlexCol className=" txt-l"></FlexCol>
                                        </Grid>)
                       );

         }

        /*const addOrgs = () =>
        {
            orgs.push( orgs.length + 1 );
            setOrgs(orgs);
            setOrgRows( orgs.map(i =>     
                                        <Grid  key={i} className="grid-show">
                                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                                          <FlexCol {...{style: {padding: '8px'}}} ><Input placeholder="Organizer" id={'organizer' + i} type="text"/></FlexCol>
                                          <FlexCol className="col-grow-2 txt-l"></FlexCol>
                                        </Grid>)
                       );
        }*/

        return (
                    <div className="App full-height" >
                        <Panel {...{title: 'Deploy Commons', titleCols: [<FlexCol fixed><PrimaryButton onClick={onLogin} >{address + ' - ' + chain}</PrimaryButton></FlexCol>], style: { height: '100%', padding: '8px', background: '#f2f2f2'}}}>
                 <Grid className="grid-show ">
                    <FlexCol fixed {...{style: {width: '20%'}}}></FlexCol >
                    <FlexCol {...{style: {padding: '8px'}}} >
                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><span className="label" >Commons Name</span><Input onChange={(e) => setCommunity(e.target.value)} placeholder="Commons Name" id="commonsname" type="text"/></FlexCol>
                          <FlexCol />
                        </Grid>
                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><span className="label" >NFT Name</span><Input onChange={(e) => setNftName(e.target.value)} placeholder="NFT Name" id="nftname" type="text"/></FlexCol>
                          <FlexCol />
                        </Grid>
                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><span className="label" >NFT Symbol</span><Input onChange={(e) => setCommunitySymbol(e.target.value)} placeholder="NFT Symbol" id="commonssymbol" type="text"/></FlexCol>
                          <FlexCol />
                        </Grid>

                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><h2>Organizers</h2></FlexCol>
                          <FlexCol />
                        </Grid>
   
                        
                        {orgRows}
                        <div className="deployButton">
                        <AddOrganzizerModal callBack={addOrgCallbackFunction} /><br/></div>
                        
                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><h2>Minters</h2></FlexCol>
                          <FlexCol />
                        </Grid>

                        {minterRows}<div className="deployButton">
                          <AddMinterModal callBack={addMinterCallbackFunction} /></div>
 
                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><Input onChange={(e) => setConfirmationsRequired(e.target.value)} placeholder="Nbr Confrimations" id="confirmations" type="text"/></FlexCol>
                          <FlexCol />
                        </Grid>
                        
                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} >
                            <div className="pui-radio-group">
                                
                                <input onChange={() => setUse('personal')} type="radio" id="personal" value="Personal" name="radio-group" className="pui-radio-input"  />
                                <span onClick={() => setUse('personal')} >Personal</span>
                                <input onChange={() => setUse('community')} type="radio" id="community" value="Communal" name="radio-group" className="pui-radio-input"  />
                                <span onClick={() => setUse('community')}>Community</span>
                            </div>
                        </FlexCol>
                        <FlexCol />
                        </Grid>
                        <Grid className="grid-show ">
                          <FlexCol fixed {...{style: {width: '35%'}}}/>
                          <FlexCol {...{style: {padding: '8px'}}} ><PrimaryButton onClick={checkDeployable} >Deploy</PrimaryButton></FlexCol>
                          <FlexCol />
                        </Grid>
                    </FlexCol>
                    <FlexCol>{message}<br/><br/><div id="loading" ><img  src="loading.gif" /></div></FlexCol>
                     </Grid>
                      </Panel>
                    </div>
               );

}

export default App;
