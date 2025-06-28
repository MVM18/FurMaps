import { FunctionComponent } from 'react';
import styles from './WAdminDashboard.module.css';


const WAdminDashboard = () => {
	return (
    		<div className={styles.wAdminDashboard}>
      			<div className={styles.header}>
        				<div className={styles.container}>
          					<div className={styles.container1}>
            						<img className={styles.backgroundIcon} alt="" src="Background.svg" />
            						<div className={styles.margin}>
              							<b className={styles.furmapsAdmin}>FurMaps Admin</b>
            						</div>
          					</div>
          					<div className={styles.container2}>
            						<div className={styles.margin1} />
            						<div className={styles.linkmargin}>
              							<div className={styles.linkButton}>
                								<img className={styles.svgmarginIcon} alt="" src="SVG:margin.svg" />
                								<div className={styles.logout}>Logout</div>
              							</div>
            						</div>
            						<div className={styles.buttonMenu}>
              							<img className={styles.svgIcon} alt="" src="SVG.svg" />
              							<div className={styles.background}>
                								<div className={styles.div}>2</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.container3}>
        				<div className={styles.container4}>
          					<div className={styles.heading1}>
            						<b className={styles.adminDashboard}>Admin Dashboard</b>
          					</div>
          					<div className={styles.container5}>
            						<div className={styles.manageUsersAnd}>Manage users and approve service providers</div>
          					</div>
        				</div>
        				<div className={styles.container6}>
          					<div className={styles.overlaybordershadowoverlayb}>
            						<div className={styles.container7}>
              							<div className={styles.container8}>
                								<div className={styles.heading1}>
                  									<div className={styles.logout}>Total Users</div>
                								</div>
                								<div className={styles.container10}>
                  									<b className={styles.b}>1,247</b>
                								</div>
              							</div>
              							<img className={styles.svgIcon1} alt="" src="SVG.svg" />
            						</div>
          					</div>
          					<div className={styles.overlaybordershadowoverlayb1}>
            						<div className={styles.container7}>
              							<div className={styles.container8}>
                								<div className={styles.heading1}>
                  									<div className={styles.logout}>Active Providers</div>
                								</div>
                								<div className={styles.container14}>
                  									<b className={styles.b}>89</b>
                								</div>
              							</div>
              							<img className={styles.svgIcon1} alt="" src="SVG.svg" />
            						</div>
          					</div>
          					<div className={styles.overlaybordershadowoverlayb2}>
            						<div className={styles.container7}>
              							<div className={styles.container8}>
                								<div className={styles.heading1}>
                  									<div className={styles.logout}>Pending Approval</div>
                								</div>
                								<div className={styles.container18}>
                  									<b className={styles.b}>2</b>
                								</div>
              							</div>
              							<img className={styles.svgIcon1} alt="" src="SVG.svg" />
            						</div>
          					</div>
          					<div className={styles.overlaybordershadowoverlayb3}>
            						<div className={styles.container7}>
              							<div className={styles.container8}>
                								<div className={styles.heading1}>
                  									<div className={styles.logout}>Suspended</div>
                								</div>
                								<div className={styles.container22}>
                  									<b className={styles.b}>3</b>
                								</div>
              							</div>
              							<img className={styles.svgIcon1} alt="" src="SVG.svg" />
            						</div>
          					</div>
        				</div>
        				<div className={styles.overlayborderoverlayblur}>
          					<div className={styles.button}>
            						<div className={styles.logout}>Pending Approvals (2)</div>
          					</div>
          					<div className={styles.buttonmargin}>
            						<div className={styles.button1}>
              							<div className={styles.logout}>All Users</div>
            						</div>
          					</div>
          					<div className={styles.buttonmargin}>
            						<div className={styles.button1}>
              							<div className={styles.logout}>Analytics</div>
            						</div>
          					</div>
          					<div className={styles.buttonmargin2} />
        				</div>
        				<div className={styles.overlaybordershadowoverlayb4}>
          					<div className={styles.container23}>
            						<div className={styles.heading3}>
              							<div className={styles.pendingServiceProvider}>Pending Service Provider Approvals</div>
            						</div>
            						<div className={styles.margin2}>
              							<div className={styles.heading1}>
                								<div className={styles.reviewAndApprove}>Review and approve new service provider applications</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.container25}>
            						<div className={styles.backgroundborder}>
              							<div className={styles.container26}>
                								<div className={styles.container27}>
                  									<div className={styles.container28}>
                    										<div className={styles.background1}>
                      											<div className={styles.js}>JS</div>
                    										</div>
                  									</div>
                  									<div className={styles.margin3}>
                    										<div className={styles.container8}>
                      											<div className={styles.heading31}>
                        												<div className={styles.johnSmith}>John Smith</div>
                      											</div>
                      											<div className={styles.container30}>
                        												<div className={styles.johnexamplecom}>john@example.com</div>
                      											</div>
                      											<div className={styles.container31}>
                        												<div className={styles.servicesDogWalking}>Services: Dog Walking, Pet Sitting</div>
                      											</div>
                      											<div className={styles.container32}>
                        												<div className={styles.servicesDogWalking}>Location: Downtown</div>
                      											</div>
                      											<div className={styles.container32}>
                        												<div className={styles.servicesDogWalking}>Submitted: 2024-01-10</div>
                      											</div>
                    										</div>
                  									</div>
                								</div>
                								<div className={styles.background2}>
                  									<img className={styles.svgmarginIcon1} alt="" src="SVG:margin.svg" />
                  									<div className={styles.div}>Pending Review</div>
                								</div>
              							</div>
              							<div className={styles.container34}>
                								<div className={styles.heading3}>
                  									<div className={styles.submittedDocuments}>Submitted Documents:</div>
                								</div>
                								<div className={styles.container35}>
                  									<div className={styles.backgroundborder1}>
                    										<div className={styles.container36}>
                      											<div className={styles.professionalCertificate}>Professional Certificate</div>
                    										</div>
                    										<div className={styles.container37}>
                      											<div className={styles.certificatepdf}>certificate.pdf</div>
                    										</div>
                    										<div className={styles.button3}>
                      											<img className={styles.svgmarginIcon1} alt="" src="SVG:margin.svg" />
                      											<div className={styles.logout}>View</div>
                    										</div>
                  									</div>
                  									<div className={styles.backgroundborder2}>
                    										<div className={styles.container38}>
                      											<div className={styles.professionalCertificate}>Valid ID</div>
                    										</div>
                    										<div className={styles.container37}>
                      											<div className={styles.certificatepdf}>id_copy.jpg</div>
                    										</div>
                    										<div className={styles.button4}>
                      											<img className={styles.svgmarginIcon1} alt="" src="SVG:margin.svg" />
                      											<div className={styles.logout}>View</div>
                    										</div>
                  									</div>
                  									<div className={styles.backgroundborder3}>
                    										<div className={styles.container40}>
                      											<div className={styles.professionalCertificate}>Proof of Address</div>
                    										</div>
                    										<div className={styles.container37}>
                      											<div className={styles.certificatepdf}>utility_bill.pdf</div>
                    										</div>
                    										<div className={styles.button5}>
                      											<img className={styles.svgmarginIcon1} alt="" src="SVG:margin.svg" />
                      											<div className={styles.logout}>View</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.container42}>
                								<div className={styles.button6}>
                  									<img className={styles.svgmarginIcon} alt="" src="SVG:margin.svg" />
                  									<div className={styles.logout}>Approve</div>
                								</div>
                								<div className={styles.buttonmargin3}>
                  									<div className={styles.button7}>
                    										<img className={styles.svgmarginIcon} alt="" src="SVG:margin.svg" />
                    										<div className={styles.logout}>Reject</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.backgroundborder}>
              							<div className={styles.container26}>
                								<div className={styles.container27}>
                  									<div className={styles.container28}>
                    										<div className={styles.background1}>
                      											<div className={styles.js}>MG</div>
                    										</div>
                  									</div>
                  									<div className={styles.margin3}>
                    										<div className={styles.container8}>
                      											<div className={styles.heading31}>
                        												<div className={styles.johnSmith}>Maria Garcia</div>
                      											</div>
                      											<div className={styles.container30}>
                        												<div className={styles.johnexamplecom}>maria@example.com</div>
                      											</div>
                      											<div className={styles.container31}>
                        												<div className={styles.servicesDogWalking}>Services: Pet Grooming</div>
                      											</div>
                      											<div className={styles.container32}>
                        												<div className={styles.servicesDogWalking}>Location: Westside</div>
                      											</div>
                      											<div className={styles.container32}>
                        												<div className={styles.servicesDogWalking}>Submitted: 2024-01-12</div>
                      											</div>
                    										</div>
                  									</div>
                								</div>
                								<div className={styles.background2}>
                  									<img className={styles.svgmarginIcon1} alt="" src="SVG:margin.svg" />
                  									<div className={styles.div}>Pending Review</div>
                								</div>
              							</div>
              							<div className={styles.container34}>
                								<div className={styles.heading3}>
                  									<div className={styles.submittedDocuments}>Submitted Documents:</div>
                								</div>
                								<div className={styles.container35}>
                  									<div className={styles.backgroundborder1}>
                    										<div className={styles.container36}>
                      											<div className={styles.professionalCertificate}>Professional Certificate</div>
                    										</div>
                    										<div className={styles.container37}>
                      											<div className={styles.certificatepdf}>grooming_cert.pdf</div>
                    										</div>
                    										<div className={styles.button3}>
                      											<img className={styles.svgmarginIcon1} alt="" src="SVG:margin.svg" />
                      											<div className={styles.logout}>View</div>
                    										</div>
                  									</div>
                  									<div className={styles.backgroundborder2}>
                    										<div className={styles.container38}>
                      											<div className={styles.professionalCertificate}>Valid ID</div>
                    										</div>
                    										<div className={styles.container37}>
                      											<div className={styles.certificatepdf}>drivers_license.jpg</div>
                    										</div>
                    										<div className={styles.button4}>
                      											<img className={styles.svgmarginIcon1} alt="" src="SVG:margin.svg" />
                      											<div className={styles.logout}>View</div>
                    										</div>
                  									</div>
                  									<div className={styles.backgroundborder3}>
                    										<div className={styles.container40}>
                      											<div className={styles.professionalCertificate}>Proof of Address</div>
                    										</div>
                    										<div className={styles.container37}>
                      											<div className={styles.certificatepdf}>lease_agreement.pdf</div>
                    										</div>
                    										<div className={styles.button5}>
                      											<img className={styles.svgmarginIcon1} alt="" src="SVG:margin.svg" />
                      											<div className={styles.logout}>View</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.container42}>
                								<div className={styles.button6}>
                  									<img className={styles.svgmarginIcon} alt="" src="SVG:margin.svg" />
                  									<div className={styles.logout}>Approve</div>
                								</div>
                								<div className={styles.buttonmargin3}>
                  									<div className={styles.button7}>
                    										<img className={styles.svgmarginIcon} alt="" src="SVG:margin.svg" />
                    										<div className={styles.logout}>Reject</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
    		</div>);
};

export default WAdminDashboard;
// File: src/pages/AdminDashboard.js