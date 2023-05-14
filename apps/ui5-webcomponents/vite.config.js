export default {
    plugins: [
        {
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith("ui5-")
                }
            }
        }
    ],
    server: {
        proxy: {
            "/Beers.json": "https://raw.githubusercontent.com/apress/SAP-UI-Frameworks-for-Enterprise-Developers-by-Marius-Obert-Volker-Buzek/main/apps/fiori-elements/webapp/localService/data/"
        }
    }
};