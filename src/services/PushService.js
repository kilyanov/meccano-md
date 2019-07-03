const OneSignal = window.OneSignal || [];

export const Push = {
    init() {
        console.log('Push init');
        OneSignal.push(() => {
            OneSignal.init({
                appId: 'e2f0346a-ac76-41ad-a63d-8397c824bcdb',
                autoResubscribe: true,
                notifyButton: {
                    enable: true
                },
                welcomeNotification: {
                    title: 'My Custom Title',
                    message: 'Thanks for subscribing!'
                }
            });
            OneSignal.showNativePrompt();
        });
    }
};
