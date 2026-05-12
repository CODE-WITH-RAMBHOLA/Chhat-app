import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaComments } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addAuth } from "../redux/slices/authSlice";
import handleScrollTop from "../utils/handleScrollTop";
import {
	MdKeyboardArrowDown,
	MdKeyboardArrowUp,
	MdNotificationsActive,
} from "react-icons/md";
import {
	setHeaderMenu,
	setLoading,
	setNotificationBox,
	setProfileDetail,
} from "../redux/slices/conditionSlice";
import { IoLogOutOutline } from "react-icons/io5";
import { PiUserCircleLight } from "react-icons/pi";

const Header = () => {
	const user = useSelector((store) => store.auth);
	const isHeaderMenu = useSelector((store) => store?.condition?.isHeaderMenu);
	const newMessageRecieved = useSelector(
		(store) => store?.myChat?.newMessageRecieved
	);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const getAuthUser = (token) => {
		dispatch(setLoading(true));
		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => res.json())
			.then((json) => {
				if (json.data) {
					dispatch(addAuth(json.data));
				} else {
					localStorage.removeItem("token");
					navigate("/signin");
				}
				dispatch(setLoading(false));
			})
			.catch((err) => {
				console.log(err);
				localStorage.removeItem("token");
				navigate("/signin");
				dispatch(setLoading(false));
			});
	};
	const { pathname } = useLocation();

	useEffect(() => {
		if (token && !user) {
			getAuthUser(token);
		}
	}, [token]);

	// Scroll to top of page && Redirect Auth change --------------------------------
	useEffect(() => {
		if (token) {
			if (pathname === "/signin" || pathname === "/signup") {
				navigate("/");
			}
		} else {
			if (pathname !== "/signin" && pathname !== "/signup") {
				navigate("/signin");
			}
		}
		dispatch(setHeaderMenu(false));
		handleScrollTop();
	}, [token, pathname, navigate, dispatch]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		window.location.reload();
		navigate("/signin");
	};

	useEffect(() => {
		var prevScrollPos = window.pageYOffset;
		const handleScroll = () => {
			var currentScrollPos = window.pageYOffset;
			if (prevScrollPos < currentScrollPos && currentScrollPos > 80) {
				document.getElementById("header").classList.add("hiddenbox");
			} else {
				document.getElementById("header").classList.remove("hiddenbox");
			}
			prevScrollPos = currentScrollPos;
		};
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const headerMenuBox = useRef(null);
	const headerUserBox = useRef(null);
	// headerMenuBox outside click handler
	const handleClickOutside = (event) => {
		if (
			headerMenuBox.current &&
			!headerUserBox?.current?.contains(event.target) &&
			!headerMenuBox.current.contains(event.target)
		) {
			dispatch(setHeaderMenu(false));
		}
	};

	// add && remove events according to isHeaderMenu
	useEffect(() => {
		if (isHeaderMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isHeaderMenu]);
	return (
		<div
			id="header"
			className="w-full h-16 md:h-20 flex justify-between items-center p-4 font-semibold bg-[#110F18] text-white border-b border-[#1C1A28] sticky top-0 z-50"
		>
			<div className="flex items-center justify-start gap-3 ml-2">
				<Link to={"/"}>
					<div className="h-10 w-10 rounded-[10px] bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-lg">
						C
					</div>
				</Link>
				<Link to={"/"}>
					<span className="text-xl font-medium tracking-wide">ChatApp</span>
				</Link>
			</div>

			{user ? (
				<div className="flex flex-nowrap items-center">
					<span
						className={`whitespace-nowrap ml-2 flex items-center justify-center relative mr-1.5 cursor-pointer ${
							newMessageRecieved.length > 0
								? "animate-bounce"
								: "animate-none"
						}`}
						title={`You have ${newMessageRecieved.length} new notifications`}
						onClick={() => dispatch(setNotificationBox(true))}
					>
						<MdNotificationsActive fontSize={25} />
						<span className="font-semibold text-xs absolute top-0 right-0 translate-x-1.5 -translate-y-1.5">
							{newMessageRecieved.length}
						</span>
					</span>
					<span className="whitespace-nowrap ml-2">
						Hi, {user.firstName}
					</span>
					<div
						ref={headerUserBox}
						onClick={(e) => {
							e.preventDefault();
							dispatch(setHeaderMenu(!isHeaderMenu));
						}}
						className="flex flex-nowrap transition-all items-center ml-3 border border-cyan-400/30 rounded-full bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 shadow-lg hover:shadow-cyan-500/30 cursor-pointer"
					>
						<img
							src={user.image}
							alt="gg"
							className="w-10 h-10 rounded-full"
						/>
						<span className="m-2">
							{isHeaderMenu ? (
								<MdKeyboardArrowDown fontSize={20} />
							) : (
								<MdKeyboardArrowUp fontSize={20} />
							)}
						</span>
					</div>
					{isHeaderMenu && (
						<div
							ref={headerMenuBox}
							className="border border-slate-700/60 text-white w-44 h-28 py-3 flex flex-col justify-center rounded-xl items-center gap-2 absolute top-20 right-4 z-40 bg-[#0F172A]/90 backdrop-blur-xl shadow-xl shadow-cyan-500/20"
						>
							<div
								onClick={() => {
									dispatch(setHeaderMenu(false));
									dispatch(setProfileDetail());
								}}
								className="flex flex-nowrap items-center w-full h-fit cursor-pointer justify-center hover:bg-purple-600/30 hover:text-white p-2 rounded-lg transition-all duration-200"
							>
								<div className="flex items-center justify-between w-2/4">
									<PiUserCircleLight fontSize={23} />
									<span>Profile</span>
								</div>
							</div>
							<div
								className="flex flex-nowrap items-center w-full h-fit cursor-pointer justify-center hover:bg-red-600/30 hover:text-white p-2 rounded-lg transition-all duration-200"
								onClick={handleLogout}
							>
								<div className="flex items-center justify-between w-2/4">
									<IoLogOutOutline fontSize={21} />
									<span>Logout</span>
								</div>
							</div>
						</div>
					)}
				</div>
			) : (
				<Link to={"/signin"}>
					<button className="py-2 px-6 border border-cyan-400/50 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-105">
						SignIn
					</button>
				</Link>
			)}
		</div>
	);
};

export default Header;
