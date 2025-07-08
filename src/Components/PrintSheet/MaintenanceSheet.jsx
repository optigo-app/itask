import { forwardRef } from 'react';
import './MaintenanceSheet.css';

const MaintenanceSheet = forwardRef((props, ref) => {
    return(
        <div ref={ref} className='containerdp10_pcl7'>
          <div className='sheetheader'>
            MAINTENANCE SHEET
          </div>
  
          <div className='mainh'>
            <div className='hfirst' style={{ borderTop: '1px solid #000' }}>
              <div>Topic :</div>
            </div>
            <div className='hsecond' style={{ borderBottom: 'none', width: '16.30%', color: ' #313131' }}>
              Ticket#
            </div>
            <div className='hthird' style={{ borderTop: '1px solid #000', fontSize: '10px'}}>
              <div style={{ marginTop: '7px', marginLeft: '12px', color: '#292929' }}>
                <input type="checkbox" className='checkbox' />
                <label style={{ marginLeft: '4px' }}>Critical</label>
              </div>
            </div>
            <div className='hfourth' style={{ borderTop: '1px solid #000' }}>
              <span><input type="checkbox" className='checkbox' /></span>
              <span style={{ marginLeft: '4px' }}>Today</span>
            </div>
            <div className='hfifth' style={{ width: '11.30%' }}>Approval
            </div>
          </div>
          <div className='mainh'>
            <div className='hfirst'>
            </div>
            <div className='hsecond' style={{ border: 'none', borderTop: '1px solid #000' }}>
            </div>
            <div className='hthird' style={{ paddingLeft: '1.5px' }}>Invoice#
            </div>
            <div className='hfourth'>
              <span><input type="checkbox" className='checkbox' /></span>
              <span style={{ marginLeft: '4px' }}>Tommorow</span>
            </div>
            <div className='hfifth'>Approval by tester
            </div>
          </div>
          <div className='mainh'>
            <div className='hfirst'>
            </div>
            <div className='hsecond' style={{ border: 'none' }}>
            </div>
            <div className='hthird' style={{ paddingLeft: '1.5px' }}>
              Bag#
            </div>
            <div className='hfourth'>
              <span><input type="checkbox" className='checkbox' /></span>
              <span style={{ marginLeft: '4px' }}>This Week</span>
            </div>
            <div className='hfifth'>Date & Time In
            </div>
          </div>
          <div className='mainh'>
            <div style={{ width: '29.50%', border: '1px solid #000', borderRight: 'none', fontSize: '10px', color: ' #292929' }}>
              <div className='mtml'>Client :</div>
            </div>
            <div style={{ width: '15.50%', fontSize: '10px', border: '1px solid #000', borderRight: 'none', color: ' #292929' }}>
              <div className='mtml'>Upload# :</div>
            </div>
            <div className='hsecond' style={{ borderTop: '1px solid #000', fontSize: '10px', color: ' #292929' }}>
              <div className='mtml' style={{ marginLeft: '1px' }}>Monitoring :</div>
            </div>
            <div className='hthird' style={{ borderBottom: '1px solid #000', paddingLeft: '1.5px' }}>
              job#
            </div>
            <div className='hfourth' style={{ borderBottom: '1px solid #000', paddingLeft: '3px', width: '13.10%' }}>
              <div style={{ marginBottom: '3px', letterSpacing: '0px' }}>Next _____________</div>
            </div>
            <div className='hfifth' style={{ borderBottom: '1px solid #000', width: '11.28%' }}>
              App
            </div>
          </div>
  
          <div style={{ border: '1px solid #000', borderTop: 'none', width: '98.10%'}}>
            <div style={{ display: 'flex' }}>
              <div className='col1'>
                <div style={{ marginTop: '1.5px', marginLeft: '1.5px' }}>Action/Steps :</div>
              </div>
              <div className='col2 mlfirst'>
                Doc migration
              </div>
              <div className='col3 mlsecond'>
                <b>^ CR</b>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div className='col1'>
              </div>
              <div className='col2 mlfirst'>
                Doc Limitation
              </div>
              <div className='col3 mlsecond'>
                <b>^ Bug</b>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div className='col1'>
              </div>
              <div className='col2 mlfirst'>
                Doc Gape
              </div>
              <div className='col3 mlsecond'>
                <b>^ SP Error</b>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div className='col1'>
              </div>
              <div className='col2 mlfirst'>
                Training Gape
              </div>
              <div className='col3 mlsecond'>
                Code Error
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div className='col1'>
              </div>
              <div className='col2 mlfirst'>
                Flow not develop
              </div>
              <div className='col3 mlsecond'>
                Slowness
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div className='col1'>
              </div>
              <div className='col2 mlfirst'>
                Central Upload
              </div>
              <div className='col3 mlsecond'>
                Patch Upload
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div className='col1'>
              </div>
              <div className='col2 mlfirst'>
                Local Account
              </div>
              <div className='col3 mlsecond'>
                Store Setting
              </div>
            </div>
            
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ display: 'flex', borderTop: '1px solid #000', borderBottom: 'none' }}>
                <div className='subcol1' style={{ marginTop: '5px', borderRight: 'none', color: ' #000000' }}>
                  <span style={{ marginLeft: '12px' }}>Checked Local</span> &nbsp;
                  <span style={{ marginLeft: '4.5px' }}><label sty>BQ</label>
                    <input type="checkbox" className='checkbox' disabled />&nbsp; &nbsp;</span>
                  <span><label sty>AQ</label>
                    <input type="checkbox" className='checkbox' disabled /></span>
                </div>
                <div style={{ width: '71.75%', borderBottom: '1px solid #BDBDBD', borderLeft: '1px solid #000' }}>
                  <div style={{ marginTop: '1.5px', marginLeft: '1.5px' }}>Tester Remark :</div>
                </div>
              </div>
              <div className='col2 mlfirst'>
                Testing Account
              </div>
              <div className='col3 mlsecond'>
                Testing Gape
              </div>
            </div>
  
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ display: 'flex', borderBottom: 'none' }}>
                <div className='subcol1' style={{ marginTop: '3px', borderRight: 'none', color: ' #000000' }}>
                  <span style={{ marginLeft: '12px' }}>Test Account</span> &nbsp; &nbsp;
                  <span style={{ marginLeft: '5.5px' }}><label sty>BQ</label> 
                    <input type="checkbox" className='checkbox' disabled />&nbsp; &nbsp;</span>
                  <span><label sty>AQ</label>
                    <input type="checkbox" className='checkbox' disabled /></span>
                </div>
                <div style={{ width: '71.80%', borderBottom: '1px solid #BDBDBD', borderLeft: '1px solid #000' }}></div>
              </div>
              <div className='col2 mlfirst'>
                Client's Account
              </div>
              <div className='col3 mlsecond'>
                Apply to all
              </div>
            </div>
  
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ display: 'flex' }}>
                <div className='subcol1' style={{ width: '27.50%', marginTop: '1px', marginRight: '3px', borderRight: 'none', color: ' #000000' }}>
                  <span style={{ marginLeft: '11px' }}>Client Account</span> &nbsp;
                  <span style={{ marginLeft: '4px' }}><label sty>BQ</label>
                    <input type="checkbox" className='checkbox' disabled />&nbsp; &nbsp;</span>
                  <span><label sty>AQ</label>
                    <input type="checkbox" className='checkbox' disabled /></span>
                </div>
                <div style={{ width: '72%', borderLeft: '1px solid #000' }}></div>
              </div>
              <div className='col2 mlfirst'>
                All Client Account
              </div>
              <div className='col3 mlsecond'>
                Client support
              </div>
            </div>
  
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ display: 'flex', borderBottom: 'none' }}>
                <div className='subcol1' style={{ color: ' #313131', borderTop: '1px solid #000', width: '29.10%', paddingTop: '4.5px', paddingBottom: '3px', paddingLeft: '1px' }}>
                  Repeat count :
                </div>
                <div style={{ width: '75%', borderBottom: '1px solid #BDBDBD' }}>
                  <div style={{marginTop: '1.5px', marginLeft: '1.5px'}}>Dev Remark :</div>
                </div>
              </div>
              <div className='row1' style={{ borderTop: '1px solid #000', borderRight: '1px solid #000'}}>
                <div style={{ paddingBottom: '11px', paddingLeft: '24px'}}>Estimate By</div>
              </div>
              <div className='row2' style={{ borderTop: '1px solid #000' }}>
                <div style={{ paddingLeft: '31px' }}>Time</div>
              </div>
            </div>
  
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ display: 'flex', borderBottom: 'none' }}>
                <div className='subcol1' style={{ width: '29.30%', paddingTop: '4.5px', paddingBottom: '3px', paddingLeft: '1px', color: ' #383838' }}>
                  Affected jobs :
                </div>
                <div style={{ width: '75%', paddingLeft: '3px', borderBottom: '1px solid #BDBDBD' }}></div>
              </div>
              <div className='col2' style={{ width: '13.60%', fontSize: '8.5px' }}>
                <div style={{ marginTop: '1px', marginBottom: '14px', marginLeft: '1px', color: '#313131' }}>Support</div>
              </div>
              <div className='col3 mlsecond'>
              </div>
            </div>
  
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ display: 'flex' }}>
                <div className='subcol1' style={{ width: '29.50%' }}></div>
                <div style={{ width: '75%', paddingLeft: '3px' }}></div>
              </div>
              <div className='col2' style={{ width: '13.60%', fontSize: '8.5px' }}>
                <div style={{ marginTop: '1px', marginBottom: '15px', marginLeft: '1px', color: ' #313131' }}>Tester</div>
              </div>
              <div className='col3 mlsecond'>
              </div>
            </div>
  
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ display: 'flex' }}>
                <div className='subcol1' style={{ borderTop: '1px solid #000', width: '28%' }}>
                  <div style={{ marginTop: '1px', marginBottom: '5px', marginLeft: '1.5px', fontWeight: '800', fontSize: '8.5px' }}>Forward To</div>
                </div>
                <div style={{ width: '40%', paddingLeft: '3px' }}></div>
              </div>
              <div className='col2' style={{ width: '13.60%', borderTop: 'none', fontSize: '8.5px' }}>
                <div style={{ marginTop: '1px', marginBottom: '14px', marginLeft: '1px', color: ' #313131' }}>Coder</div>
              </div>
              <div className='col3 mlsecond'>
              </div>
            </div>
  
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ fontSize: '7px', display: 'flex', borderTop: '1px solid #000', borderBottom: 'none' }}>
                <div style={{ marginTop: '1px', marginLeft: '1.5px' }}>Closing Remark :</div>
              </div>
              <div className='row1' style={{ borderTop: '1px solid #000', borderRight: '1px solid #000' }}>
                <div style={{ paddingTop: '5px', paddingBottom: '7px', paddingLeft: '13px' }}>Root cause report</div>
              </div>
              <div className='row2' style={{ borderTop: '1px solid #000' }}>
                <div style={{ paddingTop: '5px', paddingBottom: '7px', paddingLeft: '32px' }}>Paid</div>
              </div>
            </div>
  
            <div style={{ display: 'flex' }}>
              <div className='col1' style={{ borderBottom: 'none' }}>
              </div>
              <div className='col2' style={{ width: '13.60%' }}>
              </div>
              <div className='col3' style={{ display: 'flex', width: '11.60%' }}>
                <span className='lastcompo' style={{ width: '50%', borderRight: '1px solid #000' }}>Yes</span>
                <span className='lastcompo' style={{ width: '50%' }}>No</span>
              </div>
            </div>
          </div>
        </div>
    );
});
export default MaintenanceSheet;