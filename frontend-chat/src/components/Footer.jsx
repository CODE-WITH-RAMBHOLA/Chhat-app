import React from "react";
import { FaComments } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<div className="w-full min-h-32 flex flex-col justify-between items-start px-6 py-8 bg-[#0B1120] border-t border-slate-700/60 text-white relative z-10">
			<h1 className="font-bold text-xl flex items-center gap-3 mb-6">
				<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">ChatApp</span>
				<FaComments fontSize={18} className="text-cyan-400 drop-shadow-md" />
			</h1>
			<div className="flex items-center justify-start w-full p-4 flex-wrap gap-4">
				<div className="flex flex-col min-w-[280px] w-[33%] my-3 space-y-2">
					<h1 className="font-semibold mb-3 text-lg text-blue-300">Contact</h1>
					<span className="text-gray-300 hover:text-white transition-colors">Rambhola kumar</span>
					<span className="text-gray-300 hover:text-white transition-colors">Bihar</span>
					<span className="text-gray-300 hover:text-white transition-colors">Pincode - 845427</span>
					<span>
						<Link
							to={"mailto:kumarrambhola77@gmail.com"}
							target="_blank"
							className="text-blue-400 hover:text-blue-300 hover:underline transition-all duration-200"
						>
							kumarrambhola77@gmail.com
						</Link>
					</span>
				</div>
				<div className="flex flex-col min-w-[280px] w-[33%] my-3 space-y-2">
					<h1 className="font-semibold mb-3 text-lg text-blue-300">Pages</h1>
					<span>
						<Link
							className="text-gray-300 hover:text-blue-400 hover:underline transition-all duration-200"
							to={"/"}
						>
							Chat App
						</Link>
					</span>
					<span>
						<Link
							className="text-gray-300 hover:text-blue-400 hover:underline transition-all duration-200"
							to={"/signin"}
						>
							SignIn
						</Link>
					</span>
					<span>
						<Link
							className="text-gray-300 hover:text-blue-400 hover:underline transition-all duration-200"
							to={"/signup"}
						>
							SignUp
						</Link>
					</span>
					<span>
						<Link
							className="text-gray-300 hover:text-blue-400 hover:underline transition-all duration-200"
							to={"/home"}
						>
							Home
						</Link>
					</span>
				</div>
				<div className="flex flex-col min-w-[280px] w-[33%] my-3 space-y-2">
					<h1 className="font-semibold mb-3 text-lg text-blue-300">Links</h1>
					<span>
						<a
							className="text-gray-300 hover:text-blue-400 hover:underline transition-all duration-200"
							href="https://www.linkedin.com/in/rambhola-kumar-721a39256"
							target="_blank"
							rel="noreferrer"
						>
							LinkedIn
						</a>
					</span>
					<span>
						<a
							className="text-gray-300 hover:text-blue-400 hover:underline transition-all duration-200"
							href="https://github.com/CODE-WITH-RAMBHOLA"
							target="_blank"
							rel="noreferrer"
						>
							Github
						</a>
					</span>
					<span>
						<a
							className="text-gray-300 hover:text-blue-400 hover:underline transition-all duration-200"
							href="mailto:kumarrambhola77@gmail.com"
							target="_blank"
							rel="noreferrer"
						>
							E-Mail
						</a>
					</span>
				</div>
			</div>
			<div className="w-full border-t border-gray-700 pt-4 mt-4">
				<h1 className="font-bold text-center text-gray-400">
					All rights 2026 &copy; ChatApp
				</h1>
			</div>
		</div>
	);
};

export default Footer;
