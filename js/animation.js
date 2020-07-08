//  https://stackoverflow.com/questions/487073/how-to-check-if-element-is-visible-after-scrolling?page=1&tab=votes#tab-top

// this is the target which is observed
let targets = document.querySelectorAll('.paused-animation');

// configure the intersection observer instance
let intersectionObserverOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 1.0
}

let observer = new IntersectionObserver(onIntersection, intersectionObserverOptions);

// provide the observer with a target
for (let i = 0; i < targets.length; i++) {
    observer.observe(targets[i]);
}

function onIntersection(entries) {
    entries.forEach(entry => {

        // If we are in the viewport
        if (entry.intersectionRatio > 0) {
            entry.target.classList.remove('paused-animation');

            // Stop watching 
            observer.unobserve(entry.target);
        }
    });
}