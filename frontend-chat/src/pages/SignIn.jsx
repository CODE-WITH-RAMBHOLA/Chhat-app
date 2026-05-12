import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addAuth } from "../redux/slices/authSlice";
import { checkValidSignInFrom } from "../utils/validate";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";
import { FaGoogle, FaGithub, FaComments } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase";

const SignIn = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [load, setLoad] = useState("");
	const [isShow, setIsShow] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	
	const logInUser = (e) => {
		toast.loading("Wait until you SignIn");
		e.target.disabled = true;
		fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email,
				password: password,
			}),
		})
			.then((response) => response.json())
			.then((json) => {
				setLoad("");
				e.target.disabled = false;
				toast.dismiss();
				if (json.token) {
					localStorage.setItem("token", json.token);
					dispatch(addAuth(json.data));
					navigate("/");
					toast.success(json?.message);
				} else {
					toast.error(json?.message);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				setLoad("");
				toast.dismiss();
				toast.error("Error : " + error.code);
				e.target.disabled = false;
			});
	};
	
	const handleLogin = (e) => {
		e.preventDefault();
		if (email && password) {
			const validError = checkValidSignInFrom(email, password);
			if (validError) {
				toast.error(validError);
				return;
			}
			setLoad("Loading...");
			logInUser(e);
		} else {
			toast.error("Required: All Fields");
		}
	};
	
	const handleSocialLogin = async (providerName) => {
		try {
			toast.loading(`Wait until you SignIn with ${providerName}`);
			setLoad(`Loading ${providerName}...`);
			
			const provider = providerName === 'Google' ? googleProvider : githubProvider;
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			
			// Extract user details
			let firstName = user.displayName || "";
			let lastName = "";
			if (firstName && firstName.includes(" ")) {
				const parts = firstName.split(" ");
				firstName = parts[0];
				lastName = parts.slice(1).join(" ");
			}
			
			const socialData = {
				email: user.email,
				firstName: firstName || "User",
				lastName: lastName,
				image: user.photoURL
			};

			// Send to our backend to get JWT token
			fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/social`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(socialData),
			})
				.then((response) => response.json())
				.then((json) => {
					setLoad("");
					toast.dismiss();
					if (json.token) {
						localStorage.setItem("token", json.token);
						dispatch(addAuth(json.data));
						navigate("/");
						toast.success(json?.message || `${providerName} Login Successful`);
					} else {
						toast.error(json?.message || `${providerName} Login Failed`);
					}
				})
				.catch((error) => {
					console.error("Backend Auth Error:", error);
					setLoad("");
					toast.dismiss();
					toast.error("Error communicating with server");
				});
				
		} catch (error) {
			console.error(`${providerName} login error:`, error);
			setLoad("");
			toast.dismiss();
			toast.error(error.message || `${providerName} login failed`);
		}
	};

	return (
		<div className="relative flex flex-col items-center justify-center py-12 min-h-[90vh] overflow-hidden bg-gradient-to-b from-slate-900 via-[#0B1120] to-[#0B1120]">
			{/* Animated Background Elements */}
			<div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
			<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
			
			<div className="z-10 w-[90%] sm:w-[70%] md:w-[50%] lg:w-[35%] max-w-[500px] border border-slate-700/50 bg-[#0F172A]/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.15)] p-8 sm:p-10 transition-all duration-300">
				
				<div className="flex flex-col items-center mb-8">
					<div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center mb-6 transform hover:scale-110 hover:rotate-3 transition-all duration-300">
						<FaComments className="text-white text-3xl drop-shadow-md" />
					</div>
					<h2 className="text-[1.75rem] font-black text-white tracking-tight drop-shadow-sm">
						Welcome Back
					</h2>
					<p className="text-slate-400 mt-2 text-sm font-medium">
						Apne account mein sign in karein
					</p>
				</div>

				<form className="w-full flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<label className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase drop-shadow-sm">
							Email Address
						</label>
						<div className="relative group">
							<input
								className="w-full bg-[#0B1120]/80 border border-slate-700/70 text-slate-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/80 transition-all placeholder-slate-600 font-medium"
								type="email"
								placeholder="p@example.com"
								name="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<label className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase drop-shadow-sm">
							Password
						</label>
						<div className="relative group">
							<input
								className="w-full bg-[#0B1120]/80 border border-slate-700/70 text-slate-200 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/80 transition-all placeholder-slate-600 font-medium tracking-widest"
								type={isShow ? "text" : "password"}
								placeholder="••••••••"
								name="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<span
								onClick={() => setIsShow(!isShow)}
								className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-cyan-400 transition-colors p-1"
							>
								{isShow ? (
									<PiEyeClosedLight fontSize={20} />
								) : (
									<PiEye fontSize={20} />
								)}
							</span>
						</div>
					</div>

					<div className="flex items-center justify-between mt-[-4px]">
						<label className="flex items-center gap-2.5 cursor-pointer group">
							<input 
								type="checkbox" 
								className="appearance-none w-4 h-4 rounded-[4px] border border-slate-600 bg-[#0B1120] checked:bg-cyan-500 checked:border-cyan-500 transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[4px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
								checked={rememberMe}
								onChange={() => setRememberMe(!rememberMe)}
							/>
							<span className="text-[13px] text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
						</label>
						<Link to="#" className="text-[13px] text-cyan-500 hover:text-cyan-400 transition-colors">
							Forgot Password?
						</Link>
					</div>

					<button
						onClick={handleLogin}
						disabled={load !== ""}
						className="group relative w-full flex justify-center items-center py-3.5 px-4 mt-2 rounded-xl text-[15px] font-bold text-white bg-gradient-to-r from-[#0E7490] to-[#1D4ED8] hover:from-[#06B6D4] hover:to-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F172A] focus:ring-cyan-500 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] disabled:opacity-70 hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] active:scale-[0.98]"
					>
						{load === "" ? (
							<span className="flex items-center gap-2">
								Sign In <span className="group-hover:translate-x-1.5 transition-transform duration-300 ease-out">→</span>
							</span>
						) : (
							load
						)}
					</button>

					<div className="relative my-4">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-slate-700/60"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-[#0F172A] text-slate-500 text-[11px] font-semibold tracking-wide">
								ya jaari rakhein
							</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<button
							type="button"
							onClick={() => handleSocialLogin('Google')}
							className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 border border-slate-700/60 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/30 hover:bg-slate-700/80 hover:text-white hover:border-slate-600 transition-all active:scale-[0.98]"
						>
							<FaGoogle className="text-[#EA4335]" />
							<span>Google</span>
						</button>
						<button
							type="button"
							onClick={() => handleSocialLogin('GitHub')}
							className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 border border-slate-700/60 rounded-xl text-sm font-medium text-slate-300 bg-slate-800/30 hover:bg-slate-700/80 hover:text-white hover:border-slate-600 transition-all active:scale-[0.98]"
						>
							<FaGithub className="text-white" />
							<span>GitHub</span>
						</button>
					</div>

					<p className="mt-4 text-center text-sm text-slate-400">
						Account nahi hai?{" "}
						<Link to="/signup" className="font-semibold text-cyan-500 hover:text-cyan-400 hover:underline transition-all">
							Sign Up karein
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default SignIn;
