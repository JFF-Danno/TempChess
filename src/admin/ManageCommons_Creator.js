import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { ethers } from 'ethers'
import MOLCOMMONS_ABI from '../CONTROLLER_ABI'

import {Grid, FlexCol} from 'pivotal-ui/react/flex-grids';
import {Panel} from 'pivotal-ui/react/panels';
import {Divider} from 'pivotal-ui/react/dividers';
import {BrandButton} from 'pivotal-ui/react/buttons';


import {Input} from 'pivotal-ui/react/inputs';


const ManageCommons_Creator = ({ signer, commons, gamma }) => {
  // ----- useState
  const [creators, setCreators] = useState('')
  const [creatorToAdd, setCreatorToAdd] = useState('')
  const [creatorToRemove, setCreatorToRemove] = useState('')


  const getCreators = async () => {
    const _creators = []
    try {
      const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
      
      // brute force iteration up to 3 minters, otherwise would rely on backend to retrieve minters list
      for (var i = 0; i < 3; i++) {
        _contract.minters(i).then((data) => {
          _creators.push(data)
          setCreators([..._creators])
        })
      }
      
    } catch (e) {
      console.log(e)
    }
  }

  const addCreator = async () => {
    try {
      // const artist = [creatorToAdd]
      const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
      const _creators = [...creators, creatorToAdd]
      const tx = await _contract.updateMinter(_creators)
      tx.wait().then(() => {
        window.location.reload()
      })
    } catch (e) {
      console.log(e)
    }
  }

  const removeCreator = async () => {
    try {
      // const artist = [creatorToRemove]
      const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
      const _creators = creators.filter(creator => creator !== creatorToRemove)
      const tx = await _contract.updateMinter(_creators)
      tx.wait().then(() => {
        window.location.reload()
      })
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getCreators()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (

     <div className="panel" >
            <Panel {...{title: 'Creator Roster', titleCols: [<FlexCol fixed></FlexCol>], style: {  padding: '8px', background: '#f2f2f2'}}}>
            <h3>Add or remove a creator by entering her Eth address below.{' '}</h3>
      {creators && (
        <div>
          {creators.map((artist, index) => (
            <p key={index}>{index+1}.{artist}</p>
          ))}
        </div>
      )}
      
        <Input type='text' value={creatorToAdd} onChange={(e) => setCreatorToAdd(e.target.value)} placeholder='Enter artist address' /><br/>
        <BrandButton onClick={addCreator}>Add</BrandButton><br/><br/>
      
        <Input type='text' value={creatorToRemove} onChange={(e) => setCreatorToRemove(e.target.value)} placeholder='Enter artist address' /><br/>
        <BrandButton onClick={removeCreator}>Remove</BrandButton>

         </Panel>
      </div>


  )
}

export default ManageCommons_Creator;
