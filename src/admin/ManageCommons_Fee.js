import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { ethers } from 'ethers'
import MOLCOMMONS_ABI from '../CONTROLLER_ABI'
import GAMMA_ABI from '../GAMMA_ABI'

import {FlexCol} from 'pivotal-ui/react/flex-grids';
import {BrandButton} from 'pivotal-ui/react/buttons';
import {Panel} from 'pivotal-ui/react/panels';
import {Input} from 'pivotal-ui/react/inputs';


const ManageCommons_Coins = ({ signer, commons, gamma }) => {
  // ----- useState
  const [fee, setFee] = useState(0)
  const [newFee, setNewFee] = useState('')

  // ----- useContext


  // ----- React router config
  const history = useHistory()

  const getFee = async () => {
    try {
      const _contract = new ethers.Contract(gamma, GAMMA_ABI, signer)
      _contract.fee().then((data) => {
        const f = ethers.utils.formatUnits(data, 'wei')
        setFee(Math.trunc(f))
      })
    } catch (e) {
      console.log(e)
    }
  }

  const updateFee = async () => {
    try {
      const _contract = new ethers.Contract(commons, MOLCOMMONS_ABI, signer)
      const tx = await _contract.updateFee(newFee)
      tx.wait().then(() => {
        window.location.reload()
      })
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getFee()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
 <div className="panel" >
                <Panel {...{title: 'Transaction Fee', titleCols: [<FlexCol fixed></FlexCol>], style: {  padding: '8px', background: '#f2f2f2'}}}>
                <h3>All sales include a transaction fee that is available to the organizers to withdraw and spend.<br/></h3> 
                <h4>Default transactin fee is 5%.</h4>
                <h4>Current Transaction Fee: {fee} %</h4><br/>
               
                <Input type='text'
                     value={newFee}
                     onChange={(e) => setNewFee(e.target.value)}
                     placeholder='Enter new fee percentage' />


               <br/> <BrandButton  onClick={updateFee} >Update</BrandButton>
</Panel> 
    </div>


  )
}

export default ManageCommons_Coins


