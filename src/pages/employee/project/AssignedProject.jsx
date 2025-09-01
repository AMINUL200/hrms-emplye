import React from 'react';
import './AssignedProject.css';
import { avatar9 } from '../../../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AssignedProject = () => {
    const navigate = useNavigate();
    const projects = [
        {
            id:1,
            title: "Office Management",
            openTasks: 1,
            completedTasks: 9,
            description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. When an unknown printer took a galley of type and scrambled it...",
            deadline: "17 Apr 2019",
            progress: 40,
            leader: avatar9,
            team: [avatar9, avatar9, avatar9, avatar9],
            extraCount: 15,
        },
        {
            id:2,
            title: "Project Management",
            openTasks: 2,
            completedTasks: 5,
            description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. When an unknown printer took a galley of type and scrambled it...",
            deadline: "17 Apr 2019",
            progress: 40,
            leader: avatar9,
            team: [avatar9, avatar9, avatar9, avatar9],
            extraCount: 15,
        },
        {
            id:3,
            title: "Video Calling App",
            openTasks: 3,
            completedTasks: 3,
            description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. When an unknown printer took a galley of type and scrambled it...",
            deadline: "17 Apr 2019",
            progress: 40,
            leader: avatar9,
            team: [avatar9, avatar9, avatar9, avatar9],
            extraCount: 15,
        },
        {
            id:4,
            title: "Hospital Administration",
            openTasks: 12,
            completedTasks: 4,
            description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. When an unknown printer took a galley of type and scrambled it...",
            deadline: "17 Apr 2019",
            progress: 70,
            leader: avatar9,
            team: [avatar9, avatar9, avatar9, avatar9],
        },
        {
            id:5,
            title: "Hospital Administration",
            openTasks: 12,
            completedTasks: 4,
            description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. When an unknown printer took a galley of type and scrambled it...",
            deadline: "17 Apr 2019",
            progress: 70,
            leader: avatar9,
            team: [avatar9, avatar9, avatar9, avatar9],
        },
    ];

    return (
        <div className="container my-4">
            <div className="row g-4 p-4">
                {projects.map((project, index) => (
                    <div 
                    className="col-md-6 col-lg-3" 
                    key={index} 
                    onClick={()=> navigate(`/organization/assigned-project/${project.id}`)}
                    style={{cursor:"pointer"}}
                    >
                        <div className="card assigned-card h-100 shadow-sm">
                            <div className="card-body position-relative">
                                {/* 3 dots menu */}
                                <FontAwesomeIcon icon={faEllipsis} className="position-absolute top-0 end-0 m-3 text-muted cursor-pointer" />

                                {/* Title */}
                                <h5 className="card-title">{project.title}</h5>
                                <small className="text-muted">
                                    {project.openTasks} open tasks, {project.completedTasks} tasks completed
                                </small>

                                {/* Description */}
                                <p className="card-text mt-2">{project.description}</p>

                                {/* Deadline */}
                                <p className="fw-bold mb-1">Deadline:</p>
                                <p>{project.deadline}</p>

                                {/* Project Leader */}
                                <p className="fw-bold mb-1">Project Leader :</p>
                                <div className="mb-2">
                                    <img src={project.leader} alt="leader" className="avatar" />
                                </div>

                                {/* Team */}
                                <p className="fw-bold mb-1">Team :</p>
                                <div className="team-avatars mb-3">
                                    {project.team.map((member, i) => (
                                        <img
                                            key={i}
                                            src={member}
                                            alt={`team-${i}`}
                                            className="avatar"
                                            style={{ zIndex: i}}
                                        />
                                    ))}
                                    
                                </div>


                                {/* Progress */}
                                <p className="fw-bold mb-1">Progress</p>
                                <div className="progress" style={{ height: '6px' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                                <small className="text-success fw-bold">{project.progress}%</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignedProject;
