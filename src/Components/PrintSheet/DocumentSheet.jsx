import { forwardRef } from 'react';
import './DocumentSheet.scss';
import { formatDate3 } from '../../Utils/globalfun';

const DocumentSheet  = forwardRef((selectedData, ref) => {
    const getAssigneeNames = (assignees) => {
        if (!assignees || !Array.isArray(assignees)) return '';
        return assignees
          .map(assignee => `${assignee.firstname} ${assignee.lastname}`.trim())
          .filter(name => name)
          .join(', ');
      };
    
  
    return (
        <div ref={ref} className="page_dt">
            {/* HEADER */}
            <div className="headerBox_dt">

                <div className="headerTitle_dt">
                    DOCUMENT SHEET
                </div>

                <div className="headerRow_dt mainInfo_dt" style={{ borderBottom: "none",}}>
                    <div className="left_dt" style={{padding:" 0px"}}>
                        <div  style={{ minHeight: "40px" }}>
                        <div className="projectName_dt" style={{padding:"0px 4px" }}>
                        {selectedData?.selectedData && selectedData?.selectedData?.taskname}
                        </div>
                        <div className="smallText_dt"  style={{padding:"0px 4px"}}>
                        {selectedData?.selectedData && (selectedData?.selectedData?.taskPr + "/" + selectedData?.selectedData?.moduleName)}
                        </div>
                        </div>
                        <div className="smallText_dt" style={{ fontWeight: "700",borderTop: "1px solid #bdbdbd", padding: "1px 4px" }}>
                            Team: <span>{getAssigneeNames(selectedData?.selectedData?.assignee)}</span>
                        </div>
                    </div>

                    <div className="right_dt" style={{ position: "relative" }}>
                        <div style={{display: "flex"}}>
                           <div> Task No:  <b style={{fontSize:"16px",marginLeft:"4px"}}>     {selectedData?.selectedData && (selectedData?.selectedData?.taskno != 0 ? selectedData?.selectedData?.taskno : "")}</b></div>
                           <div style={{color:selectedData?.selectedData?.priority ? "black" : "#dbdbdb",textDecoration:"underline",marginLeft:"25px",marginBottom:'0.8px',fontSize:"16px",fontWeight:"bold"}}> {selectedData?.selectedData && (selectedData?.selectedData?.priority ? selectedData?.selectedData?.priority : "Priority")}</div>
                        </div>
                        <div>
                            Deadline: <b style={{fontSize:"14px",marginLeft:"4px"}}>  {selectedData?.selectedData && formatDate3(selectedData?.selectedData?.DeadLineDate)} </b>
                        </div>
                        <div>
                            Ticket No:  <span>  {selectedData?.selectedData && (selectedData?.selectedData?.ticketno ? selectedData?.selectedData?.ticketno : "")}  </span>
                        </div>
                        <div   >
                         Incharge: 

                         </div>
                    </div>
                </div>

                <div className="headerRow_dt">
                    <div style={{ width: "30%", borderTop: "1px solid #bdbdbd" }}>
                        Printed On:  {selectedData?.selectedData && formatDate3(selectedData?.selectedData?.StartDate)}
                    </div>

                    <div style={{ width: "40%", borderRight: "1px solid #bdbdbd", borderTop: "1px solid #bdbdbd",display:"flex" }}>
                         
                         <div style={{width:"50%"}}>Client:</div>
                         <div style={{width:"50%"}}>By:</div>
                         
                    </div>
                  
                </div>

                <div className="headerRow_dt   ">
                    <div style={{width:"30%"}}>
                        Version: 
                    </div>

                    <div style={{width:"40%"}}>
                       Release:
                    </div>
                    <div style={{width:"20%"}}>
                    Upload Dt:
                    </div>
 
                </div>

                <div className="headerRow_dt">
            

                    <div className="tagRow_dt" style={{ width: "46%" }}>
                        
                       <div style={{display:"flex",gap:"9px",alignItems:"center"}}> 
                        <div> <span style={{fontSize:"15px"}}>□</span> Tag</div>
                        <div> <span style={{fontSize:"15px"}}>□</span> Print</div>
                        <div> <span style={{fontSize:"15px"}}>□</span> Excel</div>
                        <div> <span style={{fontSize:"15px"}}>□</span> Report</div>
                        <div> <span style={{fontSize:"15px"}}>□</span> Dashboard</div>
                        <div> <span style={{fontSize:"15px"}}>□</span> Add On</div>

                        </div>
                    </div>

                    <div className="tagRow_dt">
                       
                        <span style={{marginRight:"3px"}}> Technology:  </span>
                       <div style={{display:"flex",gap:"9px",alignItems:"center"}} >
                       <div>  <span style={{fontSize:"15px"}}>□</span> .Net</div>
                       <div> <span style={{fontSize:"15px"}}>□</span> React</div>
                     <div>   <span style={{fontSize:"15px"}}>□</span> NextJs</div>
                       <div> <span style={{fontSize:"15px"}}>□</span> SQL</div>
                       <div> <span style={{fontSize:"15px"}}>□</span> Postman</div>
                       <div> <span style={{fontSize:"15px"}}>□</span> API</div>
                       </div>
                    </div>
                </div>

                <div className="docBriefLabel_dt">
                   Doc Brief: 
                </div>

                <div className="docLines_dt"></div>
                <div className="docLines_dt"></div>
                

            </div>

            <div className="bodo_dt">
                <div className="bodoItem_dt">
                    <div className="bodoHeade_dt">
                        BRD Details
                    </div>
                    <div className="bodoContent_dt">
                        <div> Team:  </div>
                        <div style={{margin :"5px 0px"}}> M1:   </div>
                        <div> M2:   </div>
                    </div>

                </div>
                <div className="bodoItem_dt">
                    <div className="bodoHeade_dt">
                        SRD / Brainstorming
                    </div>
                    <div className="bodoContent_dt">

                        <div className="SRDItem_dt">  <div className="bodo-m_dt">M1:</div>  <span>Sign: </span> </div>
                        <div className="SRDItem_dt">  <div className="bodo-m_dt">M2:</div>  <span>Sign: </span> </div>
                        <div className="SRDItem_dt">  <div className="bodo-m_dt" >M3:</div>  <span>Sign: </span> </div>
                        <div className="SRDItem_dt">  <div className="bodo-m_dt">M4:</div>  <span>Sign: </span> </div>
                    </div>

                </div>
                <div className="bodoItem_dt">
                    <div className="bodoHeade_dt" style={{ borderRight: "1px solid #bdbdbd" }}>
                        Estimate
                    </div>
                    <div className="bodoContent_dt" style={{ borderRight: "1px solid #bdbdbd" }}>
                        <div className="SRDItem_dt"> <span style={{width:"40px"}}> UI </span> <span style={{width:"10px"}}>|</span> <div className="bodo-m_dt" style={{width: "30%"}}>Hrs:</div>  <span>By: </span> </div>
                        <div className="SRDItem_dt"> <span style={{width:"40px"}}> CODE </span>  <span style={{width:"10px"}}>|</span>  <div className="bodo-m_dt" style={{width: "30%"}}>Hrs:</div>  <span>By:</span> </div>
                        <div className="SRDItem_dt"> <span style={{width:"40px"}}> API </span>  <span style={{width:"10px"}}>|</span>  <div className="bodo-m_dt" style={{width: "30%"}}>Hrs:</div>  <span>By:</span> </div>
                        <div className="SRDItem_dt"> <span style={{width:"40px"}}> DB </span> <span style={{width:"10px"}}>|</span>  <div className="bodo-m_dt" style={{width: "30%"}}>Hrs:</div>  <span>By:</span> </div>
                    </div>
                </div>
            </div>
            {/* WORKFLOW TITLE */}
            <div className="sectionHeader_dt" style={{ textAlign: "center",borderTop:"1px solid #bdbdbd",fontWeight:400 }}>  
                WORKFLOW STATUS & TIMELINE (TRACKING)
            </div>

            {/* MAIN TABLE */}
            <table className="mainTable_dt">
                <thead>
                    <tr>
                        <th className="processCol_dt" style={{fontWeight:400}}>
                            Process Stage
                        </th>
                        <th style={{ padding: "0px" }}> <div className="bod-bot-gray_dt">Assign Date</div>  <div>Assignee</div> </th>

                        <th style={{ padding: "0px" }}> <div className="bod-bot-gray_dt">Start Date</div>  <div>End Date</div> </th>
                        {/* <th></th> */}
                        <th style={{fontWeight:400}}>Approved By</th>
                        <th style={{fontWeight:400}}>Checklist</th>
                        <th style={{fontWeight:400}}>Delay Remark (If any)</th>
                    </tr>
                </thead>

                <tbody>
                    <tr className="tallRow_dt">
                        <td>
                            <b>1. BRD </b>

                        </td>

                        <td style={{ padding: "0px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px"}}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>

                    </tr>

                    <tr className="tallRow_dt">
                        <td>
                            <b>2. SRD</b>
                        </td>

                        <td style={{ padding: "0px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px"}}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>

                    </tr>

                    <tr>
                        <td style={{ height: "36px" }}> <b> 3. SOW </b></td>
                        <td style={{ padding: "0px", height: "30px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px", height: "30px" }}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>

                    </tr>

                    <tr>
                    <td style={{ height: "36px" }}> <b> 4. SRS</b></td>
                        <td style={{ padding: "0px", height: "30px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px", height: "30px" }}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>

                    </tr>

                    <tr className="tallRow_dt">
                        <td>
                            <b>5. BODO</b>
                            <br />
                            BODO By: 
                            <br />
                            BODO Appr:  
                             
                        </td>

                        <td style={{ padding: "0px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px" }}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>

                    </tr>
                    <tr className="tallRow_dt">
                        <td>
                            <b>6. Commercial </b>

                        </td>

                        <td style={{ padding: "0px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px"}}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>

                    </tr>

                    <tr className="mediumRow_dt">
                        <td>
                            <b>7. Code</b>
                            <br />
                            Senior Approval:  
                            <br />
                            Dev By: 
                        </td>

                        <td style={{ padding: "0px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px" }}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>

                    </tr>

                    <tr className="tallRow_dt">
                        

                        <td style={{ height: "36px" }}> <b> 8. Test</b></td>
                        <td style={{ padding: "0px", height: "30px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px", height: "30px" }}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>

                        <td></td>
                        <td></td>
                        <td></td>
                        

                    </tr>

                    <tr>
                      
                        <td style={{ height: "36px" }}>  <b> 9. Final Delivery</b> <br />
                        <div style={{marginTop:"2px"}}>Feedback Dt:</div> </td>
                        <td style={{ padding: "0px", height: "30px" }}>
                            <div className="bod-bot-gray_dt" style={{ height: "50%" }}> </div>  <div> </div>
                        </td>
                        <td style={{ padding: "0px", height: "30px" }}> 
                        <div  className="bod-bot-gray_dt" style={{ height:"50%"}}> </div>  <div> </div>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                    

                    </tr>
                </tbody>
            </table>

            {/* PREVIEW */}
            <div className="sectionHeader_dt " style={{  fontWeight:400 }}>
                DOCUMENTATION PREVIEW (POST-DEVELOPMENT)
            </div>

            <table className="previewTable_dt">
                <thead>
                    <tr>
                        <th style={{fontWeight:400}}>Preview Points</th>
                        <th style={{fontWeight:400}}>Assign Date</th>
                        <th style={{fontWeight:400}}>Person</th>
                        <th style={{fontWeight:400}}>Complete Date</th>
                        <th style={{fontWeight:400}}>Remarks</th>
                    </tr>
                </thead>

                <tbody>
                    <tr className="previewRo_dt" >
                        <td style={{ padding: 0 }}>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%",padding:"3px" }}>P1:</div>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%",padding:"3px" }}>P2:</div>
                            <div style={{  height:"33%",padding:"3px" }}>P3:</div>
                            
                        </td>
                        <td style={{ padding: 0 }}>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                            <div style={{   height:"33%" }}></div>
                            
                        </td>
                        <td style={{ padding: 0 }}>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                            <div style={{  height:"33%" }}></div>
                            
                        </td>
                        <td style={{ padding: 0 }}>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                            <div style={{   height:"33%" }}></div>
                            
                        </td>
                        <td style={{ padding: 0 }}>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                            <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                            <div style={{  height:"33%" }}></div>
                            
                        </td>
                       
                    </tr>
                </tbody>
            </table>

            <div className="bodo_dt">
                <div className="bodoItem_dt">
                    <div className="bodoHeade_dt" style={{ fontWeight: "400" }}>
                        Test Info
                    </div>
                    <div className="bodoContent_dt" style={{minHeight: "90px"}}>
                        <div style={{fontSize:"10px"}}>Test By:
                              </div>
                        <div style={{margin :"15px 0px",fontSize:"10px"}}>Prior Dev Approval:
                              </div>
                        <div style={{fontSize:"10px"}}>Estimate:
                              </div>
                    </div>

                </div>
                <div className="bodoItem_dt">
                    <div className="bodoHeade_dt" style={{   fontWeight: "400" }}>
                     Release Info
                    </div>
 
                    <div className="bodoContent_dt" style={{minHeight: "90px",padding: "0px"}}>
                        <div style={{marginBottom:"2px",borderBottom:"1px solid #bdbdbd",padding:"0px 3px"}}>Local:   </div>
                        <div style={{marginBottom:"2px",borderBottom:"1px solid #bdbdbd",padding:"0px 3px"}}>Alpha:   </div>
                        <div style={{marginBottom:"2px",borderBottom:"1px solid #bdbdbd",padding:"0px 3px"}}>Beta:   </div>
                        <div style={{marginBottom:"2px",borderBottom:"1px solid #bdbdbd",padding:"0px 3px"}}>Live:   </div>
                        <div style={{ padding:"0px 3px" }}>Back Version:   </div>
                    </div>
                    

                </div>
                <div className="bodoItem_dt">
                    <div className="bodoHeade_dt" style={{ borderRight: "1px solid #bdbdbd" , fontWeight: "400" }}>
                        Release Checklist
                    </div>
                    <div className="bodoContent_dt" style={{ borderRight: "1px solid #bdbdbd", minHeight: "90px",lineHeight:"0.9" }}>
                        <div className="SRDItem_dt">  <div style={{width: "50%",marginBottom:"3px"}}><span style={{fontSize:"15px"}}>□</span> Helpfile</div>  <span><span style={{fontSize:"15px"}}>□</span> Security </span> </div>
                        <div className="SRDItem_dt">  <div style={{width: "50%",marginBottom:"3px"}}><span style={{fontSize:"15px"}}>□</span> Video</div>  <span><span style={{fontSize:"15px"}}>□</span> Flag Based </span> </div>
                        <div className="SRDItem_dt">  <div style={{width: "50%",marginBottom:"3px"}}><span style={{fontSize:"15px"}}>□</span> Welcome Banner</div>  <span><span style={{fontSize:"15px"}}>□</span> WA/Email Promo </span> </div>
                        <div className="SRDItem_dt">  <div style={{width: "50%",marginBottom:"3px"}}><span style={{fontSize:"15px"}}>□</span> Ticket Update</div>   <span><span style={{fontSize:"15px"}}>□</span> Backup </span> </div>
                        
 
                    </div>
                </div>
            </div>

            <div className="bodo_dt" style={{ borderTop: "1px solid #bdbdbd"  }}>
                <div className="bodoItem_dt" style={{  width:"33.5%" }}>
                    <div className="bodoHeade_dt" style={{  fontWeight: "400" }}>
                       Support training
                    </div>
                    <div className="bodoContent_dt" style={{height: "45px"}}>
                        <div style={{fontSize:"10px"}}> Date:  </div>
                        <div style={{margin :"7px 0px",fontSize:"10px"}}> By:  </div>
                        <div style={{fontSize:"10px"}}> Attendees:  </div>
                    </div>

                </div>
                <div className="bodoItem_dt" style={{ borderRight: "1px solid #bdbdbd" ,width:"67%" }}>
                    <div className="bodoHeade_dt" style={{   fontWeight: "400" }}>
                     Remarks
                    </div>
                    

                    <div className="bodoContent_dt" style={{height: "45px",padding: "0px"}}>
                         <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                         <div style={{  borderBottom: "1px solid #bdbdbd",height:"33%" }}></div>
                         <div style={{   height:"33%" }}></div>
                    </div>
                    

                </div>
              
            </div>
              

            <div   style={{ border: "1px solid #bdbdbd",display:"flex" ,height:"30px" }}>
                <div style={{width:"40%", display:"flex" ,padding: "5px" }}> <span style={{width: "50%"}}>Data Loading: Yes/no </span> <span> Performance:</span> </div>
                <div style={{width:"30%",   display:"flex" ,padding: "5px" }}> Data Cleanup Required?</div>
                <div style={{width:"30%",   display:"flex" ,padding: "5px" }}>  <span><span style={{fontSize:"15px"}}>□</span> User log </span> <span style={{marginLeft:"10px"}}><span style={{fontSize:"15px"}}>□</span> Transaction log </span></div>
                {/* <div style={{  display:"flex" , padding: "5px" }}>Setting/setup Document:</div> */}
            </div>
            
            <div   style={{ border: "1px solid #bdbdbd",display:"flex",borderTop: "none" ,height:"41px" }}>
                
                <div style={{ width:"100%" ,display:"flex"  ,padding: "5px" }}> Closing Statement By Stackholder / Final Remarks:</div>
                 
            </div>
            
        </div>
    );
});

export default DocumentSheet ;