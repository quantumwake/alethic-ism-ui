import {useEffect, useState} from "react";

function StateNodeProperty({ data })
{
    const [stateObject, setStateObject] = useState({
        name: '',
        version: '',
        primary_key: [],
        query_state_inheritance: [],
        remap_query_state_columns: [],
        template_columns: [],
    });


    // Fetch state object details from the backend
    useEffect(() => {
        const fetchStateObject = async () => {
            try {
                const response = await fetch(`/state/${data.objectId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setStateObject(data);
            } catch (error) {
                console.error('Failed to fetch state object:', error);
            }
        };

        if (data.objectId) {
            fetchStateObject();
        }
    }, [data.objectId]);

    return (
        <div>
            <h3>Option - StateSet</h3>
            <p>{data.object_id}</p>
        </div>
    );
}

export default StateNodeProperty

// Repeat for NodePropertiesB and NodePropertiesC...
