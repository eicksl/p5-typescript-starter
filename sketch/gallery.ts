function Gallery(this: any) {

    this.visuals = [];
    this.selectedVisual = null;
    const self = this;

    // Add a new visualisation to the navigation bar.
    this.addVisual = function(
            vis: { hasOwnProperty: (arg0: string) => any; id: string;
            name: string | undefined; preload: () => void; }) {

        // Check that the vis object has an id and name.
        if (!vis.hasOwnProperty('id') && !vis.hasOwnProperty('name')) {
            alert('Make sure your visualisation has an id and name!');
        }

        // Check that the vis object has a unique id.
        if (this.findVisIndex(vis.id) != null) {
            alert(`Vis '${vis.name}' has a duplicate id: '${vis.id}'`);
        }

        this.visuals.push(vis);

        // Create menu item.
        const menuItem = createElement('li', vis.name);
        menuItem.addClass('menu-item');
        menuItem.id(vis.id);

        menuItem.mouseOver(e => {
            const el = select('#' + e.target.id);
            el!.addClass('hover');
        });

        menuItem.mouseOut(e => {
            const el = select('#' + e.target.id);
            el!.removeClass('hover');
        });

        menuItem.mouseClicked(e => {
            const menuItems = selectAll('.menu-item');  // remove selected class from any other menu-items

            for (let i = 0; i < menuItems.length; i++) {
                menuItems[i].removeClass('selected');
            }
            const el = select('#' + e.target.id);
            el!.addClass('selected');

            self.selectVisual(e.target.id);
        });

        const visMenu = select('#visuals-menu');
        visMenu!.child(menuItem);

        // Preload data if necessary.
        if (vis.hasOwnProperty('preload')) {
            vis.preload();
        }
    };

    this.findVisIndex = function(visId: any) {
        // Search through the visualisations looking for one with the id
        // matching visId.
        for (let i = 0; i < this.visuals.length; i++) {
            if (this.visuals[i].id === visId) {
                return i;
            }
        }

        // Visualisation not found.
        return null;
    };

    this.selectVisual = function(visId: any) {
        const visIndex = this.findVisIndex(visId);

        if (visIndex != null) {
            // If the current visualisation has a deselect method run it.
            if (this.selectedVisual != null
                && this.selectedVisual.hasOwnProperty('destroy')) {
                this.selectedVisual.destroy();
            }
            // Select the visualisation in the gallery.
            this.selectedVisual = this.visuals[visIndex];

            // Initialise visualisation if necessary.
            if (this.selectedVisual.hasOwnProperty('setup')) {
                this.selectedVisual.setup();
            }

            // Enable animation in case it has been paused by the current
            // visualisation.
            loop();
        }
    };
}
