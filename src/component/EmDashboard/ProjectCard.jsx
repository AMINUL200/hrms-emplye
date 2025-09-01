import React from 'react'
import { leaderImg, memberImg1 } from '../../assets'

const ProjectCard = () => {
    return (
        <div className="project-grid">
            <div className="project-top">
                <h6>
                    <a href="#">Deadline : 10 Feb 2024</a>
                </h6>
                <h5>
                    <a href="#">Office Management</a>
                </h5>
                <p>Creating an online platform that enables various administrative  tasks within an organization</p>
            </div>
            <div className="project-middle">
                <ul className="nav">
                    <li>
                        <div className="project-tasks">
                            <h4>20</h4>
                            <p>Total Tasks</p>
                        </div>
                    </li>
                    <li>
                        <div className="project-tasks">
                            <h4>15</h4>
                            <p>Total Completed</p>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="project-bottom">
                <div className="project-leader">
                    <ul className="nav">
                        <li>Project Leader :</li>
                        <li>
                            <a href="#" data-bs-toggle="tooltip" aria-label="Jeffery Lalor" data-bs-original-title="Jeffery Lalor">
                                <img src={leaderImg} alt="User"/>
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="project-leader">
                    <ul className="nav">
                        <li>Members :</li>
                        <li>
                            <a href="#" data-bs-toggle="tooltip" aria-label="Lesley Grauer" data-bs-original-title="Lesley Grauer">
                                <img src={memberImg1} alt="User"/>
                            </a>
                        </li>
                        <li>
                            <a href="#" data-bs-toggle="tooltip" aria-label="Richard Miles" data-bs-original-title="Richard Miles">
                                <img src={memberImg1} alt="User"/>
                            </a>
                        </li>
                        <li>
                            <a href="#" data-bs-toggle="tooltip" aria-label="Loren Gatlin" data-bs-original-title="Loren Gatlin">
                                <img src={memberImg1} alt="User"/>
                            </a>
                        </li>
                        <li>
                            <a href="#" data-bs-toggle="tooltip" aria-label="Jeffery Lalor" data-bs-original-title="Jeffery Lalor">
                                <img src={memberImg1} alt="User"/>
                            </a>
                        </li>
                        <li>
                            <a href="#" data-bs-toggle="tooltip" aria-label="Tarah Shropshire" data-bs-original-title="Tarah Shropshire">
                                <img src={memberImg1} alt="User"/>
                            </a>
                        </li>
                        <li>
                            <a href="#" className="more-team-members">+16</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ProjectCard
