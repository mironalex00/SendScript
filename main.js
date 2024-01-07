//	Function that retrieves the token from discord
const getTokenFromStorage = function (debugging = false, count = 0) {
	//	Create sessionStorage object when does not exist
	if (!window.sessionStorage) {
		// If debugging show message
		if (debugging) console.warn("SessionStorage not defined, creating");
		// Create object
		window.sessionStorage = {
			//	Data
			data: {},
			listeners: {},
			//	Get Item
			getItem(key) {
				return this.data[key] || null;
			},
			//	Set Item
			setItem(key, value) {
				const last =  this.data[key] ?? null;
				this.data[key] = value;
				this.emitStorageChangeEvent({ key, value, last, type: 'setItem' });
			},
			//	Remove item
			removeItem(key) {
				delete this.data[key];
				this.emitStorageChangeEvent({ key, type: 'removeItem' });
			},
			// Clear
			clear() {
				this.data = {};
				this.emitStorageChangeEvent({ type: 'clear' });
			},
			//	Events
			addEventListener(eventType, listener) {
				if (!this.listeners[eventType]) {
				  this.listeners[eventType] = [];
				}
				this.listeners[eventType].push(listener);
			},
			emitStorageChangeEvent(event) {
				const eventType = 'storage';
				if (this.listeners[eventType]) {
					for (const listener of this.listeners[eventType]) listener(event);
				}
			}
		}
	}
	// Create function that intercepts the token
	const run = async () => {
		// Return promise
		return new Promise(( resolve, reject ) => {
			//	Variable definitions
			if(window.sessionStorage.getItem("token")) resolve(window.sessionStorage.getItem("token"));
			// Guarda la función original para restaurarla más tarde
			const originalSend = XMLHttpRequest.prototype.send;
			// Sobrescribe la función send
			XMLHttpRequest.prototype.send = function (data) {
				//	Envolve execution in try-catch
				try {
					// Define constants
					const { __sentry_xhr_v2__: xhr_response } = this;
					const listening = window.sessionStorage.getItem("listening");
					// Check listener
					if ((/true/i).test(listening)) {
						// Define variables from response
						const { method, request_headers: { authorization }, url } = xhr_response;
						// Check method is get and authorization header is present
						if (method === "GET" && !(!authorization)) {
							//	Show debugging output
							if(debugging) console.warn("Token found: %s in URL (%s)", authorization, url);
							//	Set sessionStorage items
							window.sessionStorage.setItem("listening", "false");
							window.sessionStorage.setItem("token", authorization);
							//	 Resolve promise
							resolve(authorization);
						}
					} else {
						if (!(/true|false/i).test(listening)) window.sessionStorage.setItem("listening", "true");
					}
					// Llama a la función original send
					originalSend.apply(this, arguments);
				}catch(err){
					// Reject promise
					if(debugging) console.error(`An error was ocurred: ${err.message}`);
					reject(err);
				}
			};
		})
	}
	//	
	const attemptToRun = async () => {
		// Return the promise
        return new Promise((resolve, reject) => {
			// Max tries
            const maxCount = 5;
			// Attempt function
            const attempt = async () => {
                try {
					// Save res
                    const token = await run();
					//	Resolve if token, otherwise try until maxCount is triggered
                    if (token) {
                        resolve(token);
                    } else if (count < maxCount) {
                        setTimeout(async () => {
                            await attempt();
                        }, 100);
                    } else {
                        throw new Error(`Failed to retrieve token after ${maxCount} attempts.`);
                    }
                } catch (error) {
					// Reject the promise
                    reject(error);
                }
            };
			// Call the function
            attempt();
        });
    };
	//	Return the promise
	return new Promise(async (resolve, reject) => {
		try {
			const token = await attemptToRun();
			resolve(token);
		}catch(err) {
			reject(err);
		}
	});
}
//	Define Send via fetch vent
const sendViaRequest = function (message, token) {
	// Define header
	const headers = {
		'Authorization': token,
		'Content-Type': "application/json",
		'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	}
	//	Define body
	const body = JSON.stringify({
		"mobile_network_type": "unknown",
		"content": message,
		"tts": false,
		"flags": 0
	});
	// Define request options
	const requestOptions = {
		method: 'POST',
		headers,
		body,
	};
	//	Save current channel id
	const channel_id = window.location.pathname.split('/').pop();
	//	Return the promise
	return new Promise(async (resolve, reject) => {
		// Resolve the fetch
		const response = await fetch(`https://discord.com/api/v9/channels/${channel_id}/messages`, requestOptions);
		// If response not OK, reject promise
		if (!response.ok) {
			// Rejject promise
			reject(`No se pudo enviar el mensaje: ${response?.message}`);
		}
		//	Resolve promise
		resolve(response);
	});
}
//	Define Send button finder
const sendViaButton = function (main) {
	//	If debugging show message
	if (debugging) console.warn("Trying to find the button");
	//	Try to find the button
	let sendBtn = (main.querySelector(`[aria-label="Send"]`) || main.querySelector(`[data-icon="send"]`));
	//	If not exist, find send button
	if (!sendBtn) {
		const divs = document.querySelectorAll('div[role="button"]');
		divs.forEach(div => {
			if (div.textContent.includes("Send")) sendBtn = div
		});
	}
	//	If debugging show message
	if (!(!sendBtn) && debugging) console.log("Button founded")
	//	Return
	return sendBtn;
}
//	Define Send via key dispatch event
const sendViaIntro = async function (message, textarea) {
	//	Focus textarea loc element
	textarea.focus();
	// Wait to make sure is focus
	await new Promise(resolve => setTimeout(resolve, 100));
	document.execCommand('insertText', false, (message));
	//	Dispatch event
	textarea.dispatchEvent(new Event('change', { bubbles: true }));
	// Wait to make sure is typed
	await new Promise(resolve => setTimeout(resolve, 100));
	//	Dispatch send vent
	textarea.dispatchEvent(new KeyboardEvent('keydown', {
		keyCode: 13,
		bubbles: true
	}));
}
//	Define function that fetch data
const fetchFromURL = async function( url, { 
		cache = 'no-cache',
		method = 'GET',
		headers: { 
			Accept = 'application/json, text/plain',
			AcceptCharset = 'utf-8',
		} = {},
	} = {} ) {
	//
	return new Promise(async (resolve, reject) => {
		// Fetch request
		const response = await fetch( url, {
			method,
			cache,
			headers: {
				Accept,
				'Accept-Charset': AcceptCharset,
			}
		});
		// Envolve try-catch
		try {
			//	Define variables
			const responseContentType = response.headers.get("Content-Type");
			let responseContentValue = null;
			//	Output type always when made request
			console.warn( "Got Content-Type: %s", responseContentType );
			//	If type not expected
			if( !responseContentType ) throw new Error( "Response allowed 'text/plain, application/json' but recieved " + responseContentType );
			//	Check if text
			if(responseContentType.includes('text')) responseContentValue = ( await response.text() );
			//	Check if json
			if(responseContentType.includes('application/json')) responseContentValue = ( await response.json() );
			//	Check if result not ok
			if( !response.ok ) {
				//	Check no url existance and throw error
				if(!url) throw new Error("URL can't be empty");
				// Reject promise
				reject(responseContentValue);
			}
			// Resolve promise
			resolve(responseContentValue);			
		}catch(err) {
			//	Reject promise
			reject(`Error: ${err.message}`);				
		}
	})
}
//	Main Script Function
function main(text, lines, debugging = false) {
	// Define URL checker 
	const isUrl = (text) => {
		try { return Boolean(new URL(text)); }
		catch (e) { return false; }
	}
	//	Define function to check wether user is on chat or not
	const isUserOnChat = function () {
		// Regex definitions allowed services
		const d_regex = /^https:\/\/discord\.com\/channels\/[\w@]+(?:\/\d{10,})?$/gm;
		const i_regex = /^https:\/\/www\.instagram\.com\/direct\/t\/\d{10,}\/?$/gm;
		const w_regex = /^https:\/\/web\.whatsapp\.com\/$/gm;
		//	Check
		switch (true) {
			case d_regex.test(window.location.href):
				return 'discord';
			case i_regex.test(window.location.href):
				return 'instagram';
			case w_regex.test(window.location.href):
				return 'whatsapp';
			default:
				return false;
		}
	}
	//	Loop through text
	return new Promise( async (resolve, reject) => {
		// Envolve execution in try-catch
		try{
			// When line's boolean, set debuggin with lines value's
			debugging = ( !!lines === lines ) ? lines : debugging;
			// Define variables
			const userService = isUserOnChat();
			//	Define text clean var with default value (text)
			let resTextClean = text, token = (userService === 'discord' ? await getTokenFromStorage(debugging) : null), urlFlag = isUrl(text);
			// Save HTML loc
			const main = (document.querySelector("#main") || document.querySelector("div[role='main']"));
			const textarea = (main?.querySelector(`div[contenteditable="true"]`) || document.querySelector('div[class*=textAreaSlate] > div > div[role="textbox"]'));
			//	Error handling
			if (!text) throw new Error("Debes indicar el texto a enviar...");
			if (userService === false || !textarea) {
				if(userService !== 'discord') throw new Error("No hay conversación abierta");
			}
			// If recieved string
			if (typeof text === 'string' || text instanceof String) {
				if( !urlFlag ) {
					// Create pattern
					const pattern = /[\n\t]+/;
					// If multiline string split chars otherwise chec how many lines
					if (pattern.test(resTextClean)) {
						resTextClean = text.split(/[\n\t]+/).map(line => line.trim()).filter(line => line);
					} else {
						if (!lines || ( lines === debugging ) || lines <= 0) throw new Error("Debes indicar cuantas veces se manda el mensaje");
					}
				}else {
					// resTextClean = await fetchFromURL(text);
					reject(`URL is not currentlty supported in these services: ${userService}. Please visit 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy'`);
				}
			} else {
				/// Clean the text
				resTextClean = resTextClean.map(line => line.trim()).filter(line => line);
			}
			//	Save if text clean is array
			const isTextArray = Array.isArray(resTextClean);
			//	Define lines
			lines = ((isTextArray ?? lines > resTextClean.length ? null : lines) ?? resTextClean.length);
			// Loop through lines
			for (let i = 0; i < (lines); i++) {
				//	Define what text gonna be
				const tempText = isTextArray ? resTextClean[i] : resTextClean;
				//	Skip if empty
				if (!tempText || tempText.length <= 0) continue;
				//	Define percentage
				const currentPercentage = (i + 1) * 100 / lines;
				//	Define debug_message 
				const debug_message = !debugging ? '' : `: ${parseInt(currentPercentage)} %`;
				//	Check percentage
				console.log("%s %d%, Is user on chat: %s", tempText, currentPercentage, userService);
				//	Send message via intro when boolean, otherwise via request (for discord)
				if (userService !== 'discord') await sendViaIntro(tempText + debug_message, textarea);
				if (userService === 'discord') await sendViaRequest(tempText + debug_message, token);
			}
			// Resolve promise
			resolve( `I have sent ${lines} lines in total` );
		}catch(err) {
			// Reject promise	
			reject(err);
		}		
	});
}

//	Export default for ES6 Modules
export default main;
